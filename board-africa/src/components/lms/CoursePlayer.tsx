'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, Circle, PlayCircle, FileText, Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VideoPlayer } from './VideoPlayer';
import { updateLessonProgress } from '@/lib/actions/lms';
import { toast } from 'sonner';

interface CoursePlayerProps {
    course: any;
    progress: any;
    initialLessonId: string;
}

export function CoursePlayer({ course, progress, initialLessonId }: CoursePlayerProps) {
    const router = useRouter();
    const [activeLessonId, setActiveLessonId] = useState(initialLessonId);
    const [completedLessons, setCompletedLessons] = useState<Set<string>>(
        new Set(progress?.completed_lessons || [])
    );
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isCompleting, setIsCompleting] = useState(false);

    // Flatten lessons for easy navigation
    const allLessons = course.modules
        .sort((a: any, b: any) => a.order_index - b.order_index)
        .flatMap((m: any) => m.lessons.sort((a: any, b: any) => a.order_index - b.order_index));

    const activeLessonIndex = allLessons.findIndex((l: any) => l.id === activeLessonId);
    const activeLesson = allLessons[activeLessonIndex];
    const nextLesson = allLessons[activeLessonIndex + 1];
    const prevLesson = allLessons[activeLessonIndex - 1];

    const handleLessonSelect = (lessonId: string) => {
        setActiveLessonId(lessonId);
        // Update URL without refresh
        window.history.pushState(null, '', `?lesson=${lessonId}`);
    };

    const handleComplete = async () => {
        if (completedLessons.has(activeLessonId)) return;

        setIsCompleting(true);
        try {
            await updateLessonProgress(course.id, activeLessonId);
            setCompletedLessons(prev => new Set(prev).add(activeLessonId));
            toast.success('Lesson completed!');

            // Auto-advance if not last lesson
            if (nextLesson) {
                handleLessonSelect(nextLesson.id);
            }
        } catch (error) {
            toast.error('Failed to save progress');
        } finally {
            setIsCompleting(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] -m-6">
            {/* Sidebar */}
            <div className={cn(
                "w-80 border-r bg-card flex flex-col transition-all duration-300 absolute inset-y-0 left-0 z-20 md:relative",
                !sidebarOpen && "-ml-80"
            )}>
                <div className="p-4 border-b flex items-center justify-between bg-muted/30">
                    <h3 className="font-semibold truncate pr-2">{course.title}</h3>
                    <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="md:hidden">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </div>
                <ScrollArea className="flex-1">
                    <div className="p-4 space-y-6">
                        {course.modules.sort((a: any, b: any) => a.order_index - b.order_index).map((module: any, i: number) => (
                            <div key={module.id} className="space-y-2">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                    Module {i + 1}: {module.title}
                                </h4>
                                <div className="space-y-1">
                                    {module.lessons.sort((a: any, b: any) => a.order_index - b.order_index).map((lesson: any) => {
                                        const isCompleted = completedLessons.has(lesson.id);
                                        const isActive = lesson.id === activeLessonId;

                                        return (
                                            <button
                                                key={lesson.id}
                                                onClick={() => handleLessonSelect(lesson.id)}
                                                className={cn(
                                                    "w-full flex items-start gap-3 p-2 rounded-md text-sm transition-colors text-left",
                                                    isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-foreground/80"
                                                )}
                                            >
                                                {isCompleted ? (
                                                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                                                ) : lesson.content_type === 'video' ? (
                                                    <PlayCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                                ) : (
                                                    <Circle className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                                                )}
                                                <span className="line-clamp-2">{lesson.title}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <div className="p-4 border-t bg-muted/10">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <span>{Math.round((completedLessons.size / allLessons.length) * 100)}% Complete</span>
                        <span>{completedLessons.size}/{allLessons.length} Lessons</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${(completedLessons.size / allLessons.length) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-background">
                {/* Top Nav */}
                <div className="h-16 border-b flex items-center justify-between px-6 bg-card/50 backdrop-blur sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
                            <Menu className="h-5 w-5" />
                        </Button>
                        <div>
                            <h2 className="font-semibold text-lg line-clamp-1">{activeLesson.title}</h2>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!prevLesson}
                            onClick={() => handleLessonSelect(prevLesson.id)}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!nextLesson}
                            onClick={() => handleLessonSelect(nextLesson.id)}
                        >
                            Next <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>

                {/* Lesson Body */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 max-w-5xl mx-auto w-full">
                    {activeLesson.content_type === 'video' ? (
                        <div className="space-y-6">
                            <VideoPlayer
                                src="https://media.w3.org/2010/05/sintel/trailer_hd.mp4" // Placeholder for now, would be activeLesson.video_url
                                onComplete={() => (!completedLessons.has(activeLessonId) && handleComplete())}
                                autoPlay={false}
                            />
                            <div className="prose dark:prose-invert max-w-none">
                                <h3>About this lesson</h3>
                                <p>In this lesson, we cover the fundamentals key concepts. Watch the video above to get started.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="prose dark:prose-invert max-w-none">
                            <h1>{activeLesson.title}</h1>
                            <div className="custom-markdown-content p-8 bg-muted/10 rounded-lg border">
                                {activeLesson.content_markdown || "Content coming soon..."}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Action */}
                <div className="p-6 border-t bg-card/50 flex justify-end">
                    <Button
                        size="lg"
                        onClick={handleComplete}
                        disabled={completedLessons.has(activeLessonId) || isCompleting}
                        className={cn(completedLessons.has(activeLessonId) && "bg-green-600 hover:bg-green-700")}
                    >
                        {completedLessons.has(activeLessonId) ? (
                            <>
                                <CheckCircle2 className="mr-2 h-5 w-5" />
                                Completed
                            </>
                        ) : (
                            "Mark as Complete"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
