// [file name]: components/Support/page.jsx
// [file content begin]
"use client"
import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, HelpCircle, Mail, Phone, MessageCircle } from "lucide-react"

export default function Support() {
  const [openSections, setOpenSections] = useState({})

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const faqItems = [
    {
      question: "How do I reset my password?",
      answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
    },
    {
      question: "How can I contact support?",
      answer: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    },
    {
      question: "What are your business hours?",
      answer: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo."
    },
    {
      question: "How do I report a bug?",
      answer: "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet."
    }
  ]

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us an email and we'll respond within 24 hours",
      details: "support@example.com"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Call us during business hours for immediate assistance",
      details: "+1 (555) 123-4567"
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with our support team in real-time",
      details: "Available 9AM-6PM EST"
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <HelpCircle className="h-6 w-6 text-blue-500" />
        <h1 className="text-3xl font-bold">Support Center</h1>
      </div>

      {/* Contact Methods */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {contactMethods.map((method, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <method.icon className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-lg">{method.title}</CardTitle>
              </div>
              <CardDescription>{method.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">{method.details}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>
            Find answers to common questions about our platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqItems.map((item, index) => (
            <div key={index} className="border rounded-lg">
              <Button
                variant="ghost"
                className="w-full justify-between p-4 h-auto"
                onClick={() => toggleSection(index)}
              >
                <span className="text-left font-medium">{item.question}</span>
                {openSections[index] ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
              {openSections[index] && (
                <div className="px-4 pb-4">
                  <p className="text-sm text-muted-foreground">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Additional Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>Need More Help?</CardTitle>
          <CardDescription>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, 
            nisl eget ultricies tincidunt, nunc nisl aliquam nisl, eget ultricies 
            nisl nisl eget nisl. Sed euismod, nisl eget ultricies tincidunt, nunc 
            nisl aliquam nisl, eget ultricies nisl nisl eget nisl.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod 
            tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, 
            quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
          <p className="text-sm text-muted-foreground">
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore 
            eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, 
            sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
// [file content end]