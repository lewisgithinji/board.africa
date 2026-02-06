import { createClient } from '@/lib/supabase/server';
import { BoardPositionCard } from '@/components/dashboard/marketplace/BoardPositionCard';

export default async function MarketplacePage() {
    const supabase = await createClient();

    // Fetch open board positions
    const { data: positions } = await supabase
        .from('board_positions')
        .select('*, organizations(name, logo_url)')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
                    <p className="text-muted-foreground">
                        Explore open board positions across the continent.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {!positions || positions.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed">
                        <p className="text-muted-foreground">No open positions found at the moment.</p>
                    </div>
                ) : (
                    positions.map((position) => (
                        <BoardPositionCard
                            key={position.id}
                            position={position}
                            organization={position.organizations}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
