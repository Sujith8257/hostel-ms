import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Eye, Edit } from 'lucide-react';
import { motion } from 'framer-motion';

export function CasesPage() {
  const cases = [
    {
      id: 'CASE-2024-001',
      name: 'Sarah Thompson',
      age: 16,
      status: 'active',
      dateReported: '2024-08-20',
      location: 'Downtown Mall',
      alerts: 3,
    },
    {
      id: 'CASE-2024-002',
      name: 'Michael Johnson',
      age: 34,
      status: 'found',
      dateReported: '2024-08-18',
      location: 'Central Park',
      alerts: 7,
    },
    {
      id: 'CASE-2024-003',
      name: 'Emily Davis',
      age: 22,
      status: 'active',
      dateReported: '2024-08-22',
      location: 'University Campus',
      alerts: 1,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="destructive">Active</Badge>;
      case 'found':
        return <Badge className="bg-green-100 text-green-800">Found</Badge>;
      case 'closed':
        return <Badge variant="outline">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Layout 
      title="Case Management" 
      breadcrumbs={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Case Management' }
      ]}
    >
      <div className="space-y-6">
        {/* Actions Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row gap-4 justify-between"
        >
          <div className="flex gap-2">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Case
            </Button>
            <Button variant="outline">
              <Search className="mr-2 h-4 w-4" />
              Advanced Search
            </Button>
          </div>
        </motion.div>

        {/* Cases Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Active Cases</CardTitle>
              <CardDescription>
                Manage missing persons cases and track their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Case ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date Reported</TableHead>
                    <TableHead>Last Location</TableHead>
                    <TableHead>Alerts</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cases.map((caseItem) => (
                    <TableRow key={caseItem.id}>
                      <TableCell className="font-medium">{caseItem.id}</TableCell>
                      <TableCell>{caseItem.name}</TableCell>
                      <TableCell>{caseItem.age}</TableCell>
                      <TableCell>{getStatusBadge(caseItem.status)}</TableCell>
                      <TableCell>{caseItem.dateReported}</TableCell>
                      <TableCell>{caseItem.location}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{caseItem.alerts}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
