import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Target, 
  CheckCircle, 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  FileText,
  Search,
  Shield,
  TrendingUp
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Easy Reporting",
    description: "Report civic issues with just a few clicks. Upload photos, add descriptions, and pinpoint locations."
  },
  {
    icon: Search,
    title: "Real-time Tracking",
    description: "Track the progress of your reported issues with live status updates and estimated resolution times."
  },
  {
    icon: Shield,
    title: "Authority Dashboard",
    description: "Municipal staff can efficiently manage, prioritize, and resolve issues through a comprehensive dashboard."
  },
  {
    icon: TrendingUp,
    title: "Analytics & Insights",
    description: "Data-driven insights help authorities make informed decisions about city infrastructure and services."
  }
];

const howItWorks = [
  {
    step: "1",
    title: "Report an Issue",
    description: "Citizens identify and report problems in their community using our simple reporting form."
  },
  {
    step: "2", 
    title: "Verification & Assignment",
    description: "Municipal authorities review, verify, and assign issues to the appropriate departments."
  },
  {
    step: "3",
    title: "Resolution Process",
    description: "Assigned teams work on resolving the issue while providing regular status updates."
  },
  {
    step: "4",
    title: "Completion & Feedback",
    description: "Once resolved, citizens are notified and can provide feedback on the resolution quality."
  }
];

const benefits = [
  "Faster response times to civic issues",
  "Increased transparency in municipal operations", 
  "Better community engagement and participation",
  "Data-driven decision making for city planning",
  "Reduced resolution times through efficient workflows",
  "Improved quality of life for all residents"
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 to-secondary/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            About CivicReports
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed mb-8">
            Empowering communities through technology to create more responsive, 
            efficient, and transparent civic services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" asChild>
              <a href="/report">Start Reporting</a>
            </Button>
            <Button variant="civic" size="lg" asChild>
              <a href="#contact">Get in Touch</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <Card className="border-none shadow-lg">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Our Mission</h3>
                <p className="text-muted-foreground">
                  To bridge the gap between citizens and local government by providing 
                  a modern, efficient platform for reporting and resolving civic issues.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Community First</h3>
                <p className="text-muted-foreground">
                  We believe in the power of community engagement and collaborative 
                  problem-solving to create better cities for everyone.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Results Driven</h3>
                <p className="text-muted-foreground">
                  We focus on measurable outcomes and continuous improvement to ensure 
                  real impact on community quality of life.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our streamlined process makes it easy for citizens to report issues and 
              for authorities to resolve them efficiently.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-full w-full h-0.5 bg-border transform translate-x-4"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Platform Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools designed for both citizens and municipal authorities
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Community Benefits</h2>
            <p className="text-muted-foreground">
              Real improvements that make a difference in daily life
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 p-4 bg-background rounded-lg">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                <span className="text-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 px-4 bg-background">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Contact & Support</h2>
            <p className="text-muted-foreground">
              Get in touch with our team for questions, support, or partnership opportunities
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6 text-center">
                <Phone className="w-8 h-8 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Phone Support</h3>
                <p className="text-muted-foreground text-sm mb-3">Monday - Friday, 8AM - 6PM</p>
                <p className="text-primary font-medium">(555) 123-CIVIC</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Mail className="w-8 h-8 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Email Support</h3>
                <p className="text-muted-foreground text-sm mb-3">24/7 response within 4 hours</p>
                <p className="text-primary font-medium">support@civicreports.gov</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <MapPin className="w-8 h-8 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Office Location</h3>
                <p className="text-muted-foreground text-sm mb-3">City Hall, 3rd Floor</p>
                <p className="text-primary font-medium">123 Government Ave</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
              <Clock className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">System Status</h3>
              <p className="text-muted-foreground text-sm mb-3">
                All systems operational • Last updated: 2 minutes ago
              </p>
              <Button variant="outline" size="sm">
                View System Status
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}