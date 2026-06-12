import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const onboardingSchema = z.object({
  studentType: z.enum(['college', 'school', 'professional'], {
    required_error: 'Please select whether you are a college student, school student, or professional',
  }),
  institutionName: z.string().min(1, 'Please enter the name of your school, college, or workplace'),
  yearOrExperience: z.string().min(1, 'Please select or enter your class, year, or work experience'),
  // phoneNumber collected separately via PhoneNumberPrompt — optional here
  phoneNumber: z.string().min(10, 'Please enter a valid 10-digit WhatsApp number').optional().or(z.literal('')),
  skills: z.array(z.string()).min(1, 'Please add at least one skill'),
  interests: z.array(z.string()).min(1, 'Please select at least one interest'),
  dailyWorkHours: z.string().min(1, 'Please select how much you can work daily'),
  expectations: z.string().min(10, 'Please write at least a few sentences (minimum 10 characters) about your expectations'),
  autoAssign: z.boolean().optional().default(false),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'adventurer') {
      return NextResponse.json({ onboardingCompleted: true }); // Only adventurers onboard
    }

    const profile = await prisma.adventurerProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        onboardingCompleted: true,
        phoneNumber: true,
      },
    });

    return NextResponse.json({
      onboardingCompleted: profile?.onboardingCompleted ?? false,
      hasPhoneNumber: !!profile?.phoneNumber,
    });
  } catch (error) {
    console.error('Failed to get onboarding status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'adventurer') {
      return NextResponse.json({ error: 'Only adventurers can onboard' }, { status: 403 });
    }

    const json = await req.json();
    const data = onboardingSchema.parse(json);

    // Save onboarding details and set primarySkills as the skills array
    await prisma.adventurerProfile.update({
      where: { userId: session.user.id },
      data: {
        studentType: data.studentType,
        institutionName: data.institutionName,
        yearOrExperience: data.yearOrExperience,
        phoneNumber: data.phoneNumber,
        primarySkills: data.skills, // sync with primarySkills in schema
        interests: data.interests,
        dailyWorkHours: data.dailyWorkHours,
        expectations: data.expectations,
        autoAssign: data.autoAssign,
        onboardingCompleted: true,
      },
    });


    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to submit onboarding:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Something went wrong while saving onboarding details' },
      { status: 500 }
    );
  }
}
