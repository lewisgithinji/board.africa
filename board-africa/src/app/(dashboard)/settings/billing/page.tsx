'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Check, CreditCard, Zap, Shield, Smartphone, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const pricingTiers = [
    {
        name: 'Starter',
        id: 'tier-starter',
        href: '#',
        price: { monthly: '$0', annually: '$0' },
        description: 'Perfect for small non-profits and committees just getting started.',
        features: [
            '1 Board/Committee',
            'Up to 5 Members',
            'Basic Meeting Management',
            'Document Storage (1GB)',
            'Standard Support',
        ],
        featured: false,
        cta: 'Current Plan',
        disabled: true,
    },
    {
        name: 'Growth',
        id: 'tier-growth',
        href: '#',
        price: { monthly: '$49', annually: '$470' },
        description: 'Everything you need to manage a growing board professionally.',
        features: [
            'Up to 3 Boards/Committees',
            'Up to 20 Members',
            'Advanced Resolution Voting',
            'E-Signatures & Annotations',
            'Document Storage (10GB)',
            'Priority Email Support',
        ],
        featured: true,
        cta: 'Upgrade to Growth',
    },
    {
        name: 'Enterprise',
        id: 'tier-enterprise',
        href: '#',
        price: { monthly: '$199', annually: '$1990' },
        description: 'Advanced governance, compliance, and security for large organizations.',
        features: [
            'Unlimited Boards',
            'Unlimited Members',
            'Compliance Library Access',
            'Single Sign-On (SSO)',
            'Dedicated Success Manager',
            'Custom Contract & SLA',
        ],
        featured: false,
        cta: 'Contact Sales',
    },
];

export default function BillingPage() {
    const [isAnnual, setIsAnnual] = useState(false);
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const [selectedTier, setSelectedTier] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'flutterwave'>('stripe');
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const onSelectPlan = (tierId: string) => {
        setSelectedTier(tierId);
        setIsDialogOpen(true);
    };

    const handleCheckout = async () => {
        if (!selectedTier) return;

        setIsLoading(selectedTier);
        try {
            const response = await fetch('/api/billing/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tierId: selectedTier,
                    isAnnual,
                    provider: paymentMethod,
                }),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || 'Failed to start checkout');
            }

            const { url } = await response.json();
            window.location.href = url;

        } catch (error) {
            console.error('Upgrade error:', error);
            toast.error('Failed to start checkout process. Please check your network or try again.');
            setIsLoading(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-10">
            <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
                <p className="text-muted-foreground max-w-2xl">
                    Manage your organization's subscription plan. Choose the plan that best fits the size and needs of your board.
                </p>
            </div>

            {/* Current Plan Summary (Visual only for now) */}
            <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Zap className="h-5 w-5 text-primary" />
                                Current Plan: <span className="font-bold">Starter (Free)</span>
                            </CardTitle>
                            <CardDescription>
                                Your plan renews automatically on <span className="font-medium text-foreground">Feb 28, 2026</span>.
                            </CardDescription>
                        </div>
                        <Button variant="outline" className="border-primary/20 hover:bg-primary/10">
                            Manage Payment Methods
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            {/* Billing Interval Toggle */}
            <div className="flex justify-center items-center space-x-4 py-4">
                <span className={cn("text-sm font-medium", !isAnnual ? "text-foreground" : "text-muted-foreground")}>
                    Monthly Billing
                </span>
                <Switch
                    checked={isAnnual}
                    onCheckedChange={setIsAnnual}
                />
                <span className={cn("text-sm font-medium", isAnnual ? "text-foreground" : "text-muted-foreground")}>
                    Annual Billing <Badge variant="secondary" className="ml-1.5 bg-green-500/10 text-green-600 hover:bg-green-500/20 text-[10px]">SAVE 20%</Badge>
                </span>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                {pricingTiers.map((tier) => (
                    <Card
                        key={tier.id}
                        className={cn(
                            "flex flex-col relative transition-all hover:shadow-md",
                            tier.featured ? "border-primary shadow-lg scale-105 z-10" : "border-border"
                        )}
                    >
                        {tier.featured && (
                            <div className="absolute -top-4 left-0 right-0 flex justify-center">
                                <Badge className="bg-primary hover:bg-primary text-primary-foreground px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-sm">
                                    Most Popular
                                </Badge>
                            </div>
                        )}
                        <CardHeader>
                            <CardTitle className="text-xl font-bold">{tier.name}</CardTitle>
                            <CardDescription className="min-h-[50px] mt-2">{tier.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-6">
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold tracking-tight">
                                    {isAnnual ? tier.price.annually : tier.price.monthly}
                                </span>
                                <span className="text-sm font-semibold text-muted-foreground">
                                    /{isAnnual ? 'year' : 'month'}
                                </span>
                            </div>

                            <ul className="space-y-3 text-sm">
                                {tier.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3 text-muted-foreground">
                                        <Check className="h-4 w-4 text-green-500 shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full font-semibold"
                                variant={tier.featured ? "default" : "outline"}
                                disabled={tier.disabled || isLoading === tier.id}
                                onClick={() => onSelectPlan(tier.id)}
                            >
                                {isLoading === tier.id ? 'Processing...' : tier.cta}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4 pt-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Shield className="h-5 w-5 text-primary" />
                            Enterprise Security
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground text-wrap">
                            We adhere to the stricter security standards including bank-grade encryption, role-based access control, and comprehensive audit logs for all plans.
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <HelpCircle className="h-5 w-5 text-primary" />
                            Need Help?
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Have questions about which plan is right for your organization? Contact our sales team for a personalized consultation.
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Select Payment Method</DialogTitle>
                        <DialogDescription>
                            Choose your preferred way to pay for the {pricingTiers.find(t => t.id === selectedTier)?.name} Plan.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <RadioGroup defaultValue="stripe" value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)} className="grid grid-cols-1 gap-4">
                            <div>
                                <RadioGroupItem value="stripe" id="stripe" className="peer sr-only" />
                                <Label
                                    htmlFor="stripe"
                                    className="flex items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                                        <div className="space-y-1">
                                            <p className="font-medium leading-none">Credit Card</p>
                                            <p className="text-xs text-muted-foreground">Visa, Mastercard, Amex</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <div className="h-4 w-6 rounded bg-slate-200" />
                                        <div className="h-4 w-6 rounded bg-slate-200" />
                                    </div>
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="flutterwave" id="flutterwave" className="peer sr-only" />
                                <Label
                                    htmlFor="flutterwave"
                                    className="flex items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <Smartphone className="h-5 w-5 text-green-600" />
                                        <div className="space-y-1">
                                            <p className="font-medium leading-none">M-Pesa / Mobile Money</p>
                                            <p className="text-xs text-muted-foreground">Safe & Instant Mobile Payments</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] text-green-600 border-green-200 bg-green-50">Recommended</Badge>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCheckout} disabled={isLoading === selectedTier}>
                            Proceed to Pay
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
