import React from 'react';
import styles from './Projects.module.css';
import { Card, Badge, Button } from '../../components/ui';
import { Folder, Clock, Users, MoreHorizontal, ArrowUpRight } from 'lucide-react';

export const Projects: React.FC = () => {
    const projects = [
        { id: 1, name: 'Website Redesign', client: 'Acme Corp', deadline: 'Dec 15, 2023', status: 'In Progress', members: 4, progress: 75 },
        { id: 2, name: 'Mobile App Development', client: 'Globex', deadline: 'Jan 20, 2024', status: 'In Progress', members: 6, progress: 30 },
        { id: 3, name: 'Internal Audit System', client: 'Internal', deadline: 'Oct 30, 2023', status: 'Review', members: 2, progress: 95 },
        { id: 4, name: 'Marketing Campaign Q4', client: 'Marketing Dept', deadline: 'Nov 01, 2023', status: 'Planning', members: 3, progress: 10 },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
                    <p className="text-gray-500 mt-1">Manage your active projects and tasks.</p>
                </div>
                <Button>
                    <Folder size={18} className="mr-2" /> New Project
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => (
                    <Card key={project.id} className="p-6 hover:shadow-md transition-shadow group cursor-pointer">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <Folder size={20} />
                            </div>
                            <button className="text-gray-400 hover:text-gray-600">
                                <MoreHorizontal size={20} />
                            </button>
                        </div>
                        
                        <h3 className="font-bold text-gray-900 text-lg mb-1">{project.name}</h3>
                        <p className="text-sm text-gray-500 mb-6">{project.client}</p>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Status</span>
                                <span className={`font-medium ${
                                    project.status === 'In Progress' ? 'text-blue-600' :
                                    project.status === 'Review' ? 'text-orange-500' : 'text-gray-600'
                                }`}>{project.status}</span>
                            </div>
                            
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                                <div 
                                    className={`h-1.5 rounded-full ${
                                        project.status === 'Review' ? 'bg-orange-500' : 'bg-primary-600'
                                    }`} 
                                    style={{ width: `${project.progress}%` }}
                                ></div>
                            </div>
                            
                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                <div className="flex -space-x-2">
                                    {[...Array(project.members)].map((_, i) => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                            {String.fromCharCode(65 + i)}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded">
                                    <Clock size={12} />
                                    {project.deadline}
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};