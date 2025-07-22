"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target, Heart, Zap, Code, GraduationCap } from "lucide-react"
import Link from "next/link"
import { ForestLayout } from "../layout/forest-layout"

const values = [
  {
    icon: Target,
    title: "Student-First",
    description: "Every decision is made with students' success and well-being in mind, reducing academic stress.",
  },
  {
    icon: Zap,
    title: "Innovation",
    description: "Leveraging cutting-edge AI technology to create learning experiences that were impossible before.",
  },
  {
    icon: Heart,
    title: "Accessibility",
    description: "Quality education tools should be available to everyone, regardless of financial background.",
  },
  {
    icon: GraduationCap,
    title: "Empowerment",
    description: "Helping students become independent learners who can tackle any academic challenge.",
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-green-900">
      {/* Math Background Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 text-6xl font-light text-green-600 dark:text-green-400 rotate-12">
          ∑
        </div>
        <div className="absolute top-32 right-20 text-4xl font-light text-green-500 dark:text-green-300 -rotate-12">
          π
        </div>
        <div className="absolute top-64 left-1/4 text-5xl font-light text-green-600 dark:text-green-400 rotate-45">
          ∫
        </div>
        <div className="absolute top-96 right-1/3 text-3xl font-light text-green-500 dark:text-green-300 -rotate-6">
          √
        </div>
        <div className="absolute bottom-96 left-16 text-4xl font-light text-green-600 dark:text-green-400 rotate-12">
          α
        </div>
        <div className="absolute bottom-64 right-16 text-5xl font-light text-green-500 dark:text-green-300 -rotate-12">
          ∆
        </div>
        <div className="absolute bottom-32 left-1/3 text-3xl font-light text-green-600 dark:text-green-400 rotate-6">
          ∞
        </div>
        <div className="absolute top-1/2 left-8 text-4xl font-light text-green-500 dark:text-green-300 -rotate-45">
          θ
        </div>
        <div className="absolute top-1/3 right-8 text-3xl font-light text-green-600 dark:text-green-400 rotate-30">
          λ
        </div>
        <div className="absolute bottom-1/3 right-1/4 text-4xl font-light text-green-500 dark:text-green-300 -rotate-30">
          Ω
        </div>

        {/* Floating geometric shapes */}
        <div className="absolute top-20 right-1/4 w-16 h-16 border-2 border-green-300 dark:border-green-600 rounded-full opacity-20 animate-float"></div>
        <div
          className="absolute top-1/2 left-20 w-12 h-12 border-2 border-green-400 dark:border-green-500 rotate-45 opacity-20 animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-1/4 right-20 w-20 h-20 border-2 border-green-300 dark:border-green-600 rounded-full opacity-20 animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-3/4 left-1/3 w-14 h-14 border-2 border-green-400 dark:border-green-500 rotate-12 opacity-20 animate-float"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </div>
      <ForestLayout>
        {/* Hero Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-6 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-700">
              🚀 Launched March 2025
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              About{" "}
              <span className="bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
                2nd Brain
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              Born from a student's frustration with traditional learning methods, 2nd Brain is revolutionizing education
              with AI-powered tools that make studying more effective, engaging, and accessible for everyone.
            </p>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16 bg-white/50 dark:bg-gray-800/50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                The Story Behind 2nd Brain
              </h2>
              <div className="prose prose-lg max-w-none text-gray-600 dark:text-gray-300">
                <p className="text-lg leading-relaxed mb-6">
                  2nd Brain was born in March 2025 from the personal struggles of its founder,{" "}
                  <strong>Malshan Dissanayaka</strong>, a passionate developer and student from Sri Lanka. Like millions
                  of students worldwide, Malshan found himself overwhelmed by the sheer volume of information he needed to
                  process and retain.
                </p>
                <p className="text-lg leading-relaxed mb-6">
                  "I was spending countless hours making flashcards, summarizing textbooks, and trying to organize my
                  study materials," recalls Malshan. "I realized that AI could automate these tedious tasks, allowing
                  students to focus on what really matters - understanding and applying knowledge."
                </p>
                <p className="text-lg leading-relaxed mb-6">
                  What started as a personal project to solve his own study challenges quickly evolved into something much
                  bigger. After seeing how dramatically AI-powered study tools improved his own academic performance,
                  Malshan knew he had to share this solution with students everywhere.
                </p>
                <p className="text-lg leading-relaxed">
                  Today, 2nd Brain serves thousands of students globally, but it remains true to its roots - a tool built
                  by a student, for students, with the mission of making quality education accessible to everyone,
                  regardless of their background or resources.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Founder Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 text-center">Meet the Founder</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 text-center mb-16 max-w-2xl mx-auto">
              The passionate developer and student who turned his academic struggles into a solution for millions.
            </p>

            <div className="max-w-4xl mx-auto">
              <Card className="overflow-hidden shadow-2xl">
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                    {/* Image/Avatar Section */}
                    <div className="bg-gradient-to-br from-green-500 to-green-600 p-12 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Code className="w-16 h-16 text-white" />
                        </div>
                        <h3 className="text-3xl font-bold mb-2">Malshan Dissanayaka</h3>
                        <p className="text-green-100 text-lg mb-4">Founder & Solo Developer</p>
                        <div className="flex items-center justify-center space-x-2 text-green-100">
                          <span>🇱🇰</span>
                          <span>Sri Lanka</span>
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-12">
                      <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">The Journey</h4>
                      <div className="space-y-4 text-gray-600 dark:text-gray-300">
                        <p>
                          <strong>Student First:</strong> As a student himself, Malshan understands the daily challenges
                          of academic life - from information overload to time management struggles.
                        </p>
                        <p>
                          <strong>Self-Taught Developer:</strong> Combining his passion for technology with his
                          educational needs, Malshan taught himself AI development to create solutions that actually work
                          for students.
                        </p>
                        <p>
                          <strong>Global Vision:</strong> From his base in Sri Lanka, Malshan is building tools that serve
                          students worldwide, proving that great ideas can come from anywhere.
                        </p>
                        <p>
                          <strong>Solo Mission:</strong> As the sole founder and developer, Malshan maintains direct
                          control over the product vision, ensuring 2nd Brain stays true to its student-first principles.
                        </p>
                      </div>

                      <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                        <p className="text-green-800 dark:text-green-200 italic">
                          "My goal is simple: make learning more effective and less stressful for every student. 2nd Brain
                          isn't just a product - it's my contribution to making education more accessible worldwide."
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-20 bg-gradient-to-r from-green-50 to-green-100 dark:from-gray-800 dark:to-green-900">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-16 text-center">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card
                  key={index}
                  className="text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <value.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{value.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Our Mission</h2>
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 text-white">
                <p className="text-2xl font-medium leading-relaxed">
                  "To democratize access to AI-powered education tools that help every student learn more effectively,
                  reduce academic stress, and achieve their full potential - regardless of their background or resources."
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">100+</div>
                  <p className="text-gray-600 dark:text-gray-300">Students Helped</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">40%</div>
                  <p className="text-gray-600 dark:text-gray-300">Average Grade Improvement</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">98%</div>
                  <p className="text-gray-600 dark:text-gray-300">Student Satisfaction</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-white/50 dark:bg-gray-800/50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Join Our Journey</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Be part of the educational revolution. Help us build the future of learning, one student at a time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                >
                  Start Learning Today
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-green-200 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900 bg-transparent"
                >
                  Get in Touch
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </ForestLayout>
    </div>
  )
}
