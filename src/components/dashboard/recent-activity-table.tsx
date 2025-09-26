import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const recentContracts = [
  {
    id: 'CN-001',
    name: 'Master Service Agreement',
    partner: 'Innovate Corp',
    status: 'Active',
    updatedAt: '2 hours ago',
  },
  {
    id: 'CN-002',
    name: 'Non-Disclosure Agreement',
    partner: 'Quantum Solutions',
    status: 'In Review',
    updatedAt: '5 hours ago',
  },
  {
    id: 'CN-003',
    name: 'Software License Agreement',
    partner: 'TechGenius Ltd.',
    status: 'Drafting',
    updatedAt: '1 day ago',
  },
  {
    id: 'CN-004',
    name: 'Supply Chain Contract',
    partner: 'Global Logistics',
    status: 'Expired',
    updatedAt: '3 days ago',
  },
  {
    id: 'CN-005',
    name: 'Partnership Agreement',
    partner: 'Synergy Partners',
    status: 'Active',
    updatedAt: '5 days ago',
  },
];

type Status = 'Active' | 'In Review' | 'Drafting' | 'Expired';

const statusVariant: Record<Status, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  'Active': 'default',
  'In Review': 'secondary',
  'Drafting': 'outline',
  'Expired': 'destructive',
};

export function RecentActivityTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Overview of the latest contract updates and statuses.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contract</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentContracts.map((contract) => (
              <TableRow key={contract.id}>
                <TableCell>
                  <div className="font-medium">{contract.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {contract.partner}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[contract.status as Status]}>
                    {contract.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{contract.updatedAt}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
