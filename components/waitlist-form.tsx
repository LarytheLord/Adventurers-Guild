import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export default function WaitlistForm() {
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('/api/waitlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (response.ok) {
      toast({
        title: "Success!",
        description: "You have been added to the waitlist.",
      });
      setEmail('');
    } else {
      toast({
        title: "Error!",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Input
          type="email"
          placeholder="Your Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="text-lg py-4 border-2 border-gray-200 focus:border-red-600"
        />
      </div>
      <Button 
        type="submit" 
        size="lg" 
        className="w-full bg-red-600 hover:bg-red-700 text-white py-4 text-xl font-bold transition-all duration-300 ease-out"
      >
        ENLIST NOW
      </Button>
    </form>
  );
}
