"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InAppMessageForm } from "./in-app-message-form";
import { VersionUpdateForm } from "./version-update-form";

export function NotificationCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>发送通知</CardTitle>
        <CardDescription>
          向用户发送站内信或版本更新通知。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="inapp" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="inapp">站内信</TabsTrigger>
            <TabsTrigger value="update">版本更新</TabsTrigger>
          </TabsList>
          <TabsContent value="inapp">
            <InAppMessageForm />
          </TabsContent>
          <TabsContent value="update">
            <VersionUpdateForm />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

