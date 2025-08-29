import React from 'react';
import type { ProjectPlan } from '../types';
import { RocketIcon } from './icons/RocketIcon';
import { InfoIcon } from './icons/InfoIcon';
import { ListIcon } from './icons/ListIcon';
import { StackIcon } from './icons/StackIcon';
import { StepIcon } from './icons/StepIcon';

interface PlanDisplayProps {
    plan: ProjectPlan;
}

const SectionCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg">
        <div className="flex items-center mb-4">
            <div className="bg-slate-100 p-2 rounded-full mr-4">{icon}</div>
            <h3 className="text-xl font-bold text-slate-800">{title}</h3>
        </div>
        <div className="text-slate-600">{children}</div>
    </div>
);

export const PlanDisplay: React.FC<PlanDisplayProps> = ({ plan }) => {
    return (
        <div className="space-y-6">
            <SectionCard title="Project Name" icon={<RocketIcon />}>
                <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-600">
                    {plan.projectName}
                </h2>
            </SectionCard>

            <SectionCard title="Description" icon={<InfoIcon />}>
                <p>{plan.description}</p>
            </SectionCard>

            <div className="grid md:grid-cols-2 gap-6">
                <SectionCard title="Key Features" icon={<ListIcon />}>
                    <ul className="list-disc list-inside space-y-2">
                        {plan.keyFeatures.map((feature, index) => (
                            <li key={index}>{feature}</li>
                        ))}
                    </ul>
                </SectionCard>

                <SectionCard title="Next Steps" icon={<StepIcon />}>
                    <ul className="list-decimal list-inside space-y-2">
                        {plan.nextSteps.map((step, index) => (
                            <li key={index}>{step}</li>
                        ))}
                    </ul>
                </SectionCard>
            </div>

            <SectionCard title="Recommended Tech Stack" icon={<StackIcon />}>
                <div className="space-y-4">
                    {plan.techStack.map((tech, index) => (
                        <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <h4 className="font-semibold text-cyan-600">{tech.name}</h4>
                            <p className="text-sm text-slate-500">{tech.reason}</p>
                        </div>
                    ))}
                </div>
            </SectionCard>
        </div>
    );
};