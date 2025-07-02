import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserCard } from '../user-card';
import type { User } from '@/types';

interface BottomLeftQuadrantProps {
  employees: User[];
  highlightedId: string | null;
}

export default function BottomLeftQuadrant({ employees, highlightedId }: BottomLeftQuadrantProps) {
  return (
    <Card className="h-full glass-card">
      <CardHeader>
        <CardTitle className="font-headline">Employees</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[250px] lg:h-[calc(100%-2rem)]">
          <div className="flex flex-wrap gap-3 pr-4">
            {employees.length > 0 ? (
              employees.map((employee) => (
                <UserCard
                  key={employee.id}
                  user={employee}
                  isHighlighted={highlightedId === employee.id}
                />
              ))
            ) : (
                <p className="w-full text-center text-muted-foreground p-4">No employees found. Add employees via Leader Actions.</p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
