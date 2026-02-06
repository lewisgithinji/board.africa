import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, Clock, BookOpen, User } from 'lucide-react';
import Link from 'next/link';

export default async function CoursesPage() {
    const supabase = await createClient();

    // Fetch published courses with minimal details
    const { data: courses } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Governance Training Academy</h1>
                    <p className="text-muted-foreground mt-2 max-w-2xl">
                        Enhance your board skills with our expert-led courses on corporate governance, compliance, and leadership.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses && courses.length > 0 ? (
                    courses.map((course) => (
                        <Link href={`/courses/${course.id}`} key={course.id} className="group">
                            <Card className="h-full hover:shadow-lg transition-all border-muted group-hover:border-primary/50 overflow-hidden">
                                <div className="aspect-video bg-muted relative overflow-hidden">
                                    {course.thumbnail_url ? (
                                        <img
                                            src={course.thumbnail_url}
                                            alt={course.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-primary/5">
                                            <PlayCircle className="h-12 w-12 text-primary/20" />
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2">
                                        <Badge variant="secondary" className="backdrop-blur-md bg-background/80 capitalize">
                                            {course.level || 'General'}
                                        </Badge>
                                    </div>
                                </div>
                                <CardHeader>
                                    <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                                        {course.title}
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-4 text-xs mt-2">
                                        <span className="flex items-center gap-1">
                                            <User className="h-3 w-3" /> {course.instructor_name || 'Board.Africa'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" /> {course.duration_minutes || 60}m
                                        </span>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground line-clamp-3">
                                        {course.description}
                                    </p>
                                </CardContent>
                                <CardFooter>
                                    <Button className="w-full" variant="secondary">
                                        Start Learning
                                    </Button>
                                </CardFooter>
                            </Card>
                        </Link>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center space-y-4">
                        <div className="bg-muted p-6 rounded-full w-fit mx-auto">
                            <BookOpen className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold">No courses available yet</h3>
                        <p className="text-muted-foreground">Check back soon for our launch content!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
