'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { User, MapPin, Clock, Camera } from 'lucide-react'

interface StudentPersonalInfoStepProps {
  onComplete: (data: any) => void
  onSkip: () => void
  canSkip: boolean
  isLoading: boolean
  initialData?: any
}

export default function StudentPersonalInfoStep({ 
  onComplete, 
  onSkip, 
  canSkip, 
  isLoading, 
  initialData 
}: StudentPersonalInfoStepProps) {
  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || '',
    dateOfBirth: initialData?.dateOfBirth || '',
    location: initialData?.location || '',
    timezone: initialData?.timezone || '',
    profileImage: initialData?.profileImage || ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const timezones = [
    'UTC-12:00 - Baker Island Time',
    'UTC-11:00 - Hawaii-Aleutian Standard Time',
    'UTC-10:00 - Hawaii Standard Time',
    'UTC-09:00 - Alaska Standard Time',
    'UTC-08:00 - Pacific Standard Time',
    'UTC-07:00 - Mountain Standard Time',
    'UTC-06:00 - Central Standard Time',
    'UTC-05:00 - Eastern Standard Time',
    'UTC-04:00 - Atlantic Standard Time',
    'UTC-03:00 - Argentina Time',
    'UTC-02:00 - Fernando de Noronha Time',
    'UTC-01:00 - Azores Time',
    'UTC+00:00 - Greenwich Mean Time',
    'UTC+01:00 - Central European Time',
    'UTC+02:00 - Eastern European Time',
    'UTC+03:00 - Moscow Standard Time',
    'UTC+04:00 - Gulf Standard Time',
    'UTC+05:00 - Pakistan Standard Time',
    'UTC+05:30 - India Standard Time',
    'UTC+06:00 - Bangladesh Standard Time',
    'UTC+07:00 - Indochina Time',
    'UTC+08:00 - China Standard Time',
    'UTC+09:00 - Japan Standard Time',
    'UTC+10:00 - Australian Eastern Standard Time',
    'UTC+11:00 - Solomon Islands Time',
    'UTC+12:00 - Fiji Time'
  ]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters'
    }

    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      
      if (age < 13 || age > 100) {
        newErrors.dateOfBirth = 'Please enter a valid date of birth'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) {
      toast.error('Please correct the errors before continuing')
      return
    }

    onComplete({
      personalInfo: formData
    })
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // In a real implementation, you would upload this to your storage service
      // For now, we'll just create a local URL
      const imageUrl = URL.createObjectURL(file)
      setFormData(prev => ({ ...prev, profileImage: imageUrl }))
      toast.success('Profile image uploaded!')
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Tell us about yourself</h3>
        <p className="text-muted-foreground">
          This information helps us personalize your experience and connect you with relevant opportunities.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {/* Profile Image */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={formData.profileImage} />
                <AvatarFallback className="text-lg">
                  {formData.fullName ? getInitials(formData.fullName) : <User className="w-8 h-8" />}
                </AvatarFallback>
              </Avatar>
              <label 
                htmlFor="profile-image"
                className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full cursor-pointer hover:bg-purple-700 transition-colors"
              >
                <Camera className="w-4 h-4" />
                <input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Enter your full name"
                className={errors.fullName ? 'border-red-500' : ''}
              />
              {errors.fullName && (
                <p className="text-sm text-red-500">{errors.fullName}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                className={errors.dateOfBirth ? 'border-red-500' : ''}
              />
              {errors.dateOfBirth && (
                <p className="text-sm text-red-500">{errors.dateOfBirth}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Optional - helps us show age-appropriate content
              </p>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">
                <MapPin className="w-4 h-4 inline mr-1" />
                Location
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="City, Country"
              />
              <p className="text-xs text-muted-foreground">
                Helps match you with local or remote opportunities
              </p>
            </div>

            {/* Timezone */}
            <div className="space-y-2">
              <Label htmlFor="timezone">
                <Clock className="w-4 h-4 inline mr-1" />
                Timezone
              </Label>
              <Select
                value={formData.timezone}
                onValueChange={(value) => setFormData(prev => ({ ...prev, timezone: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Important for scheduling and collaboration
              </p>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Privacy & Security
            </h4>
            <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Your personal information is encrypted and secure</li>
              <li>• Only your name and general location are visible to companies</li>
              <li>• You control what information to share in your public profile</li>
              <li>• We never sell your data to third parties</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        {canSkip && (
          <Button variant="outline" onClick={onSkip} disabled={isLoading}>
            Skip for now
          </Button>
        )}
        
        <div className="ml-auto space-x-2">
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || !formData.fullName.trim()}
          >
            {isLoading ? 'Saving...' : 'Continue'}
          </Button>
        </div>
      </div>

      {/* Required Fields Notice */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          <span className="text-red-500">*</span> Required fields
        </p>
      </div>
    </div>
  )
}
