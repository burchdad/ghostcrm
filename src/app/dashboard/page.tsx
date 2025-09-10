import { Card } from "@/components/ui/card";

export default function Dashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-4">Units Sold: 10</Card>
      <Card className="p-4">Gross: $50,000</Card>
      <Card className="p-4">Closing %: 42%</Card>
      <Card className="col-span-1 md:col-span-2 p-4 mt-4">Today’s Leads & Tasks (Coming Soon)</Card>
      <Card className="p-4 mt-4">AI Assistant Card (Coming Soon)</Card>
    </div>
  );
}
