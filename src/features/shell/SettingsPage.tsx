import { Card, Input, Button, Select } from "@/components/ui";
import { Settings2, Bell, Shield } from "lucide-react";

export function SettingsPage() {
  return (
    <div className="p-6 space-y-5 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 font-display">
          Settings
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Manage your workspace preferences
        </p>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Settings2 className="w-4 h-4 text-brand-400" />
          <h3 className="text-sm font-semibold text-zinc-200 font-display">
            General
          </h3>
        </div>
        <div className="space-y-4">
          <Input label="Workspace Name" defaultValue="Amgo Games" />
          <Input
            label="Contact Email"
            defaultValue="admin@amgo.dev"
            type="email"
          />
          <Select
            label="Default Page Size"
            options={[
              { value: "10", label: "10" },
              { value: "25", label: "25" },
              { value: "50", label: "50" },
            ]}
          />
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-zinc-200 font-display">
            Notifications
          </h3>
        </div>
        <div className="space-y-3">
          {[
            "Job completed alerts",
            "Campaign status changes",
            "Budget threshold warnings",
          ].map((item) => (
            <label key={item} className="flex items-center justify-between">
              <span className="text-sm text-zinc-300">{item}</span>
              <div className="w-10 h-5 bg-brand-500 rounded-full cursor-pointer relative">
                <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm" />
              </div>
            </label>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-zinc-200 font-display">
            Security
          </h3>
        </div>
        <div className="space-y-3 text-sm text-zinc-400">
          <p>
            Session expires in <span className="text-zinc-200">24 hours</span>
          </p>
          <p>
            2FA: <span className="text-emerald-400">Enabled</span>
          </p>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button variant="primary">Save Preferences</Button>
      </div>
    </div>
  );
}
