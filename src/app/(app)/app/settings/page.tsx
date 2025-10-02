// src/app/(app)/settings/page.tsx
"use client";

import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PersonalDetailsCard } from "@/components/app/settings/personal-details";
import { WorkshopDetailsPanel } from "@/components/app/settings/workshop-details";
// import { EmployeesPanel } from "@/components/app/settings/employees";
import { DataExportPanel } from "@/components/app/settings/data-export";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Settings</h1>
      </div>

      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="personal">Personal Details</TabsTrigger>
          <TabsTrigger value="workshop">Workshop Details</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="data">Data Export/Import</TabsTrigger>
        </TabsList>

        {/* Personal */}
        <TabsContent value="personal" className="space-y-4">
          <PersonalDetailsCard />
        </TabsContent>

        {/* Workshop stub */}
        <TabsContent value="workshop">
       

            <WorkshopDetailsPanel />
        
        </TabsContent>

        {/* Employees stub */}
        <TabsContent value="employees">
          <Card>
            <CardHeader><CardTitle>Employees</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Coming soon — staff list, roles & permissions…
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Export/Import stub */}
        <TabsContent value="data">
  <Card>
    <CardHeader><CardTitle>Data Export/Import</CardTitle></CardHeader>
    <CardContent className="space-y-4">
      <DataExportPanel />
    </CardContent>
  </Card>
</TabsContent>
      </Tabs>

      <Separator />
      <div className="text-xs text-muted-foreground">
        Note: Changing your email will require confirmation once we wire Supabase auth.
      </div>
    </div>
  );
}
