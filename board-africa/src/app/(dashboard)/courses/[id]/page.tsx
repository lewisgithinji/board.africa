import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, BarChart, BookOpen, ChevronRight, PlayCircle, FileText, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default async function CourseDetailsPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch course with modules and lessons
    const { data: course, error } = await supabase
        .from('courses')
        .select(`
            *,
            modules:course_modules(
                *,
                lessons:course_lessons(*)
            )
        `)
        .eq('id', id)
        .single();

    if (error || !course) {
        notFound();
    }

    // Sort modules and lessons
    const sortedModules = course.modules?.sort((a: any, b: any) => a.order_index - b.order_index) || [];
    sortedModules.forEach((mod: any) => {
        mod.lessons?.sort((a: any, b: any) => a.order_index - b.order_index);
    });

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Hero Header */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="capitalize">{course.level}</Badge>
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {course.duration_minutes} Minutes
                            </span>
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight">{course.title}</h1>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            {course.description}
                        </p>
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 border">
                                <AvatarFallback>IN</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-medium">Instructor</p>
                                <p className="font-bold">{course.instructor_name || 'Board.Africa Expert'}</p>
                            </div>
                        </div>
                    </div>

                    <Separator className="my-8" />

                    {/* Course Curriculum */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <BookOpen className="h-6 w-6 text-primary" />
                            Course Content
                        </h2>

                        <div className="space-y-4">
                            {sortedModules.map((module: any, index: number) => (
                                <Card key={module.id} className="overflow-hidden">
                                    <div className="bg-muted/30 px-6 py-4 flex items-center justify-between font-semibold">
                                        <span>Module {index + 1}: {module.title}</span>
                                        <span className="text-xs text-muted-foreground">{module.lessons?.length || 0} Lessons</span>
                                    </div>
                                    <CardContent className="p-0">
                                        <div className="divide-y">
                                            {module.lessons?.map((lesson: any) => (
                                                <div key={lesson.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/10 transition-colors">
                                                    {lesson.content_type === 'video' ? (
                                                        <PlayCircle className="h-5 w-5 text-primary shrink-0" />
                                                    ) : (
                                                        <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                                                    )}
                                                    <div className="flex-1">
                                                        <p className="font-medium text-sm">{lesson.title}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {lesson.content_type === 'video' ? `${lesson.duration_minutes} min` : 'Reading'}
                                                        </p>
                                                    </div>
                                                    {lesson.is_preview ? (
                                                        <Badge variant="secondary" className="text-xs">Preview</Badge>
                                                    ) : (
                                                        <div className="h-4 w-4 rounded-full border-2 border-muted" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Call to Action */}
                <div className="space-y-6">
                    <Card className="sticky top-6 border-2 border-primary/10 shadow-xl overflow-hidden">
                        <div className="aspect-video bg-muted relative">
                            {course.thumbnail_url && (
                                <img src={course.thumbnail_url} className="w-full h-full object-cover" alt="Course thumbnail" />
                            )}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/20 transition-colors cursor-pointer group">
                                <PlayCircle className="h-16 w-16 text-white drop-shadow-lg group-hover:scale-110 transition-transform" />
                            </div>
                        </div>
                        <CardContent className="p-6 space-y-6">
                            <Link href={`/courses/${id}/learn`} className="w-full block">
                                <Button className="w-full text-lg h-12 font-bold" size="lg">
                                    Start Course Now
                                    <ChevronRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>

                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <span>Full lifetime access</span>
                                </div>
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <span>Access on mobile and desktop</span>
                                </div>
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <span>Certificate of completion</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
