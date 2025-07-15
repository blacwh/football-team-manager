'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  CalendarIcon, 
  TrophyIcon, 
  ChartBarIcon,
  PlayIcon,
  UserGroupIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const features = [
  {
    name: 'Smart Scheduling',
    description: 'Automatically generate fair game schedules for 3-4 teams with optimal rest distribution.',
    icon: CalendarIcon,
    href: '/scheduler',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Live Scoreboard',
    description: 'Track real-time scores and automatically calculate league standings.',
    icon: TrophyIcon,
    href: '/league',
    color: 'from-purple-500 to-pink-500',
  },
  {
    name: 'Game History',
    description: 'Review past games, analyze performance, and track team progress over time.',
    icon: ChartBarIcon,
    href: '/history',
    color: 'from-green-500 to-emerald-500',
  },
  {
    name: 'Team Management',
    description: 'Manage players, track statistics, and organize team information.',
    icon: UserGroupIcon,
    href: '/players',
    color: 'from-orange-500 to-red-500',
  },
];

const stats = [
  { name: 'Games Scheduled', value: '156+' },
  { name: 'Teams Managed', value: '24+' },
  { name: 'Goals Scored', value: '890+' },
  { name: 'Saturday Sessions', value: '52+' },
];

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Hero Section */}
      <section className="hero-section relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-purple-900/90"></div>
        <div className="hero-content relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <div className="mb-6">
                <div className="inline-block bg-yellow-400 text-yellow-900 px-6 py-2 rounded-full font-bold text-lg md:text-xl shadow-lg animate-pulse-yellow">
                  ⚽ 80's Football Club ⚽
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-heading">
                Saturday Games
                <span className="block bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                  Management
                </span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl">
                The ultimate football team management platform. Schedule games, track scores,
                manage league tables, and celebrate victories—all in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/scheduler"
                  className="gradient-button inline-flex items-center px-8 py-4 text-lg font-semibold"
                >
                  <PlayIcon className="w-5 h-5 mr-2" />
                  Start Scheduling
                </Link>
                <Link
                  href="/league"
                  className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white border-2 border-white rounded-lg hover:bg-white hover:text-blue-900 transition-all duration-300"
                >
                  <TrophyIcon className="w-5 h-5 mr-2" />
                  View League
                </Link>
              </div>
            </motion.div>

            {/* Hero Image/Visual */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="glass-card p-8 text-center">
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-6xl animate-pulse-yellow border-4 border-yellow-300">
                  ⚽
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Saturday Warriors Unite!
                </h3>
                <p className="text-blue-100">
                  Join the ultimate football management experience designed for passionate teams.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <div key={stat.name} className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-4xl md:text-5xl font-bold text-yellow-600 mb-2"
                >
                  {stat.value}
                </motion.div>
                <div className="text-gray-600 font-medium">{stat.name}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4 font-heading">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed specifically for Saturday football leagues.
              Simple to use, yet comprehensive enough for serious team management.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link href={feature.href} className="group block h-full">
                  <div className="football-card p-8 h-full">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-yellow-600 transition-colors">
                      {feature.name}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                    <div className="mt-6 flex items-center text-yellow-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                      Get Started 
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-yellow-600 to-yellow-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <StarIcon className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-6 font-heading">
              Ready to Dominate Your Saturday League?
            </h2>
            <p className="text-xl text-yellow-100 mb-8 max-w-2xl mx-auto">
              Join thousands of teams already using our platform to manage their games.
              Start your free management experience today!
            </p>
            <Link
              href="/scheduler"
              className="gradient-button inline-flex items-center px-8 py-4 text-lg font-semibold bg-white text-yellow-800 hover:bg-yellow-50"
            >
              <CalendarIcon className="w-5 h-5 mr-2" />
              Create Your First Schedule
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}