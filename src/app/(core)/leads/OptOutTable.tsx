import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Search } from "lucide-react";

interface OptOutTableProps {
  optedOutLeads: any[];
}

export default function OptOutTable({ optedOutLeads }: OptOutTableProps) {
  const [filter, setFilter] = useState("");

  const filtered = optedOutLeads.filter(l =>
    l["Full Name"]?.toLowerCase().includes(filter.toLowerCase()) ||
    l["Phone Number"]?.toLowerCase().includes(filter.toLowerCase()) ||
    l["Email Address"]?.toLowerCase().includes(filter.toLowerCase()) ||
    l["Company"]?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h2 className="text-xl font-bold text-red-600">Opted-Out Leads</h2>
          <div className="text-sm text-gray-500">
            {optedOutLeads.length} lead{optedOutLeads.length !== 1 ? 's' : ''} opted out
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search opted-out leads by name, phone, email, or company..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-10"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {optedOutLeads.length === 0 
              ? "No opted-out leads found. All leads are currently active." 
              : "No opted-out leads match your search criteria."
            }
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Phone</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden lg:table-cell">Company</TableHead>
                  <TableHead className="hidden md:table-cell">Opted Out</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(lead => (
                  <TableRow key={lead.id} className="group">
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold text-red-600">{lead["Full Name"]}</div>
                        <div className="text-sm text-gray-500 sm:hidden">
                          {lead["Phone Number"] && (
                            <div>{lead["Phone Number"]}</div>
                          )}
                          {lead["Email Address"] && (
                            <div className="truncate max-w-[150px]">{lead["Email Address"]}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {lead["Phone Number"] || "-"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="truncate max-w-[200px]">
                        {lead["Email Address"] || "-"}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {lead["Company"] || "-"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-xs text-gray-500">
                        {lead["Created Date"] ? new Date(lead["Created Date"]).toLocaleDateString() : "-"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </Card>
  );
}
