"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
    MdTrendingUp, MdMouse, MdAttachMoney,
    MdSchedule, MdPeople, MdEmail, MdPublic, MdSearch, MdAdsClick
} from "react-icons/md";
import { motion } from "framer-motion";

import { useTheme } from "@/providers/ThemeProvider";
import { getCampaignByIdService } from "@/services/campaigns.service";
import { PageHeader } from "@/components/common/Pageheader";
import { SectionCard } from "@/components/common/Sectioncard";

// --- Enhanced Mock Data Generators ---

const generateDailyStats = () => [
    { day: 'Mon', reach: 6240, clicks: 420 },
    { day: 'Tue', reach: 8100, clicks: 580 },
    { day: 'Wed', reach: 5400, clicks: 390 },
    { day: 'Thu', reach: 9800, clicks: 750 },
    { day: 'Fri', reach: 11200, clicks: 890 },
    { day: 'Sat', reach: 7600, clicks: 510 },
    { day: 'Sun', reach: 6100, clicks: 410 },
];

const trafficSources = [
    { name: 'Email Newsletter', value: 45, icon: <MdEmail />, color: 'bg-blue-100 text-blue-600' },
    { name: 'Social Ads (FB/IG)', value: 30, icon: <MdPublic />, color: 'bg-pink-100 text-pink-600' },
    { name: 'Organic Search', value: 15, icon: <MdSearch />, color: 'bg-emerald-100 text-emerald-600' },
    { name: 'Referral Partners', value: 10, icon: <MdAdsClick />, color: 'bg-purple-100 text-purple-600' },
];

export default function CampaignAnalyticsPage() {
    const { currentTheme } = useTheme();
    const router = useRouter();
    const params = useParams();
    const campaignId = Number(params.id);

    // Fetch Campaign Details
    const { data: campaign, isLoading, isError } = useQuery({
        queryKey: ['campaign', campaignId],
        queryFn: () => getCampaignByIdService(campaignId),
        enabled: !!campaignId
    });

    const stats = React.useMemo(() => generateDailyStats(), []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (isError || !campaign) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <p className="text-lg font-medium text-red-500">Failed to load analytics.</p>
                <button
                    onClick={() => router.push('/campaigns')}
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    style={{ color: currentTheme.textColor }}
                >
                    Back to Campaigns
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto pb-20 space-y-8 fade-in-up">

            {/* Header */}
            <PageHeader
                title="Campaign Analytics"
                subtitle={`Performance insights for "${campaign.name}"`}
                backLink="/campaigns"
            />

            {/* Overview Stats Cards - Pixel Perfect Design */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Impressions"
                    value={(campaign.reach || 45230).toLocaleString()}
                    trend="+12.5%"
                    icon={<MdPeople size={22} />}
                    color="text-blue-600"
                    bgColor="bg-blue-50"
                    theme={currentTheme}
                />
                <StatCard
                    title="Unique Clicks"
                    value={(campaign.clicks || 1845).toLocaleString()}
                    trend="+5.2%"
                    icon={<MdMouse size={22} />}
                    color="text-emerald-600"
                    bgColor="bg-emerald-50"
                    theme={currentTheme}
                />
                <StatCard
                    title="Budget Utilization"
                    value={`$${(campaign.spent || 850).toLocaleString()}`}
                    subValue={`of $${(campaign.budget || 2500).toLocaleString()}`}
                    icon={<MdAttachMoney size={22} />}
                    color="text-amber-600"
                    bgColor="bg-amber-50"
                    theme={currentTheme}
                />
                <StatCard
                    title="Click-Through Rate"
                    value="4.8%"
                    trend="+0.8%"
                    icon={<MdTrendingUp size={22} />}
                    color="text-purple-600"
                    bgColor="bg-purple-50"
                    theme={currentTheme}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Visual Charts */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Performance Trends Chart */}
                    <SectionCard title="Performance Trends (Weekly)" stepNumber={1} bgColor="bg-indigo-50" textColor="text-indigo-600" >
                        <div className="h-80 flex flex-col justify-end pt-6 px-4">
                            <div className="flex justify-between items-end h-full gap-4 sm:gap-6">
                                {stats.map((stat, i) => {
                                    const maxReach = 12000;
                                    const heightPercent = (stat.reach / maxReach) * 100;
                                    return (
                                        <div key={i} className="flex flex-col items-center gap-3 flex-1 group relative h-full justify-end">
                                            {/* Tooltip */}
                                            <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10">
                                                <div
                                                    className="text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-xl"
                                                    style={{ backgroundColor: currentTheme.headingColor }}
                                                >
                                                    {stat.reach.toLocaleString()}
                                                    <span className="block text-[10px] font-normal opacity-80">{stat.clicks} Clicks</span>
                                                </div>
                                                <div className="w-2 h-2 rotate-45 mx-auto -mt-1" style={{ backgroundColor: currentTheme.headingColor }}></div>
                                            </div>

                                            {/* Bar */}
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${heightPercent}%` }}
                                                transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.1 }}
                                                className="w-full sm:w-12 rounded-t-xl opacity-90 hover:opacity-100 transition-all cursor-pointer relative overflow-hidden"
                                                style={{
                                                    background: `linear-gradient(180deg, ${currentTheme.primary} 0%, ${currentTheme.primary}80 100%)`,
                                                }}
                                            >
                                                {/* Shine Effect */}
                                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                                            </motion.div>

                                            {/* Label */}
                                            <span
                                                className="text-xs font-bold uppercase tracking-wider transition-colors group-hover:text-blue-600"
                                                style={{ color: currentTheme.textColor }}
                                            >
                                                {stat.day}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </SectionCard>
                </div>

                {/* Right Column: Campaign Details & Audience */}
                <div className="space-y-6">
                    {/* Status Card */}
                    <div
                        className="rounded-2xl border p-6 shadow-sm relative overflow-hidden"
                        style={{
                            backgroundColor: currentTheme.cardBg,
                            borderColor: currentTheme.borderColor
                        }}
                    >
                        {/* Decorative Background Blob */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>

                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2 relative z-10" style={{ color: currentTheme.headingColor }}>
                            <MdSchedule className="text-blue-600" /> Campaign Status
                        </h3>

                        <div className="space-y-5 relative z-10">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold opacity-70" style={{ color: currentTheme.textColor }}>Current Status</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize shadow-sm border ${campaign.status === 'active' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                                    campaign.status === 'paused' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                                        'bg-gray-50 border-gray-100 text-gray-600'
                                    }`}>
                                    {campaign.status}
                                </span>
                            </div>

                            <div className="h-px w-full bg-gray-100"></div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-bold uppercase opacity-60 mb-1" style={{ color: currentTheme.textColor }}>Start Date</p>
                                    <p className="text-sm font-bold" style={{ color: currentTheme.headingColor }}>
                                        {new Date(campaign.scheduled_start_date).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase opacity-60 mb-1" style={{ color: currentTheme.textColor }}>End Date</p>
                                    <p className="text-sm font-bold" style={{ color: currentTheme.headingColor }}>
                                        {new Date(campaign.scheduled_end_date).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-2">
                                <p className="text-xs font-bold uppercase opacity-60 mb-1" style={{ color: currentTheme.textColor }}>Channel</p>
                                <div className="flex gap-2">
                                    {Array.isArray(campaign.channel)
                                        ? campaign.channel.map(c => (
                                            <span key={c} className="text-xs font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded capitalize">
                                                {c}
                                            </span>
                                        ))
                                        : <span className="text-xs font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded capitalize">{campaign.channel || 'Email'}</span>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Traffic Sources - Moved here */}
                    <SectionCard title="Traffic Sources" stepNumber={2} bgColor="bg-cyan-50" textColor="text-cyan-600" height="auto">
                        <div className="space-y-5">
                            {trafficSources.map((source, i) => (
                                <div key={source.name} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${source.color}`}>
                                            {source.icon}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold" style={{ color: currentTheme.headingColor }}>{source.name}</p>
                                            <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${source.value}%` }}
                                                    transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                                                    className="h-full rounded-full"
                                                    style={{ backgroundColor: currentTheme.primary }} // Or distinct colors if preferred
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-bold block" style={{ color: currentTheme.headingColor }}>
                                            {source.value}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SectionCard>


                </div>

            </div>
        </div>
    );
}

// Helper Component for Stats
function StatCard({ title, value, subValue, trend, icon, color, bgColor, theme }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
            style={{
                backgroundColor: theme.cardBg,
                borderColor: theme.borderColor
            }}
        >
            {/* Background Icon Watermark */}
            <div className={`absolute -right-4 -bottom-4 opacity-5 transform rotate-12 scale-150 transition-transform group-hover:scale-125 ${color}`}>
                {icon}
            </div>

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${bgColor} ${color}`}>
                    {icon}
                </div>
                {trend && (
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${trend.startsWith('+') ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {trend.startsWith('+') ? <MdTrendingUp size={12} /> : null} {trend}
                    </span>
                )}
            </div>
            <div className="relative z-10">
                <p className="text-sm font-bold uppercase tracking-wide opacity-60 mb-1" style={{ color: theme.textColor }}>{title}</p>
                <h3 className="text-3xl font-extrabold tracking-tight" style={{ color: theme.headingColor }}>{value}</h3>
                {subValue && <p className="text-xs mt-1 font-medium opacity-50" style={{ color: theme.textColor }}>{subValue}</p>}
            </div>
        </motion.div>
    );
}
