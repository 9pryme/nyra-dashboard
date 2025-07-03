"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2, Settings, Save } from "lucide-react";
import { motion } from "framer-motion";
import { useServiceFeatures, useBatchUpdateSettings } from "@/hooks/use-admin";

interface FeatureSettings {
  id: string;
  name: string;
  properties: any;
}

export default function ConfigPage() {
  const [localFeatures, setLocalFeatures] = useState<FeatureSettings[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // React Query hooks
  const { 
    data: features, 
    isLoading, 
    error,
    refetch: refetchFeatures 
  } = useServiceFeatures();
  
  const batchUpdateMutation = useBatchUpdateSettings();

  // Initialize local state when features are loaded
  useEffect(() => {
    if (features && !localFeatures.length) {
      setLocalFeatures(features);
    }
  }, [features, localFeatures.length]);

  // Update local state when features change
  useEffect(() => {
    if (features && features.length > 0 && !hasUnsavedChanges) {
      setLocalFeatures(features);
    }
  }, [features, hasUnsavedChanges]);

  const handleSettingChange = (settingsId: string, path: string[], value: any) => {
    setLocalFeatures(prev => 
      prev.map(feature => {
        if (feature.id === settingsId) {
          const updatedProperties = { ...feature.properties };
          let current = updatedProperties;
          
          // Navigate to the nested property
          for (let i = 0; i < path.length - 1; i++) {
            if (!current[path[i]]) {
              current[path[i]] = {};
            }
            current = current[path[i]];
          }
          current[path[path.length - 1]] = value;
          
          return { ...feature, properties: updatedProperties };
        }
        return feature;
      })
    );
    setHasUnsavedChanges(true);
  };

  const saveAllChanges = () => {
    const updates = localFeatures.map(feature => ({
      settingsId: feature.id,
      properties: feature.properties
    }));
    
    batchUpdateMutation.mutate(updates, {
      onSuccess: () => {
        setHasUnsavedChanges(false);
      }
    });
  };

  const findFeature = (id: string) => localFeatures.find((f: FeatureSettings) => f.id === id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !localFeatures.length) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error.message || 'Failed to load data'}</AlertDescription>
        </Alert>
        <Button onClick={() => refetchFeatures()} variant="outline" className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  const chosenProviders = findFeature('chosen_providers')?.properties?.chosen_providers;
  const walletTiers = findFeature('wallet_tiers')?.properties?.wallet_tiers;
  const walletSettings = findFeature('wallet')?.properties?.wallet;
  const airtimeAndData = findFeature('airtimeAndData')?.properties?.airtimeAndData;
  const bills = findFeature('bills')?.properties?.bills;
  const authentication = findFeature('authentication')?.properties?.authentication;
  const userSettings = findFeature('user')?.properties?.user;
  const cardSettings = findFeature('card')?.properties?.card;
  const feesSettings = findFeature('fees')?.properties?.fees;
  const thresholds = findFeature('service_balance_thresholds')?.properties?.service_balance_thresholds;

  return (
    <div className="space-y-6 max-w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Settings className="h-6 w-6" />
              Configuration Panel
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage all platform settings and configurations
            </p>
          </div>
          
          {hasUnsavedChanges && (
            <Button onClick={saveAllChanges} disabled={batchUpdateMutation.isPending} className="flex items-center gap-2">
              {batchUpdateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save All Changes
            </Button>
          )}
        </div>

        {batchUpdateMutation.isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{batchUpdateMutation.error?.message || 'Failed to save settings'}</AlertDescription>
          </Alert>
        )}
      </motion.div>

      <Tabs defaultValue="wallet" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="authentication">Auth</TabsTrigger>
          <TabsTrigger value="fees">Fees</TabsTrigger>
          <TabsTrigger value="limits">Limits</TabsTrigger>
        </TabsList>

        {/* Wallet Settings */}
        <TabsContent value="wallet" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Wallet Controls</CardTitle>
                <CardDescription>
                  Enable or disable wallet-related features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {walletSettings && Object.entries(walletSettings).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label htmlFor={`wallet-${key}`} className="text-sm capitalize">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Label>
                    <Switch
                      id={`wallet-${key}`}
                      checked={value as boolean}
                      onCheckedChange={(checked) => handleSettingChange('wallet', ['wallet', key], checked)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Settings</CardTitle>
                <CardDescription>
                  Control user-facing features and permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {userSettings && Object.entries(userSettings).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label htmlFor={`user-${key}`} className="text-sm capitalize">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Label>
                    <Switch
                      id={`user-${key}`}
                      checked={value as boolean}
                      onCheckedChange={(checked) => handleSettingChange('user', ['user', key], checked)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Services */}
        <TabsContent value="services" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Airtime & Data</CardTitle>
                <CardDescription>
                  Control airtime and data purchase features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {airtimeAndData && Object.entries(airtimeAndData).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label htmlFor={`airtime-${key}`} className="text-sm capitalize">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Label>
                    <Switch
                      id={`airtime-${key}`}
                      checked={value as boolean}
                      onCheckedChange={(checked) => handleSettingChange('airtimeAndData', ['airtimeAndData', key], checked)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bills & Utilities</CardTitle>
                <CardDescription>
                  Enable or disable bill payment services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {bills && Object.entries(bills).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label htmlFor={`bills-${key}`} className="text-sm capitalize">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Label>
                    <Switch
                      id={`bills-${key}`}
                      checked={value as boolean}
                      onCheckedChange={(checked) => handleSettingChange('bills', ['bills', key], checked)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Card Management</CardTitle>
                <CardDescription>
                  Control card-related features and operations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cardSettings && Object.entries(cardSettings).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label htmlFor={`card-${key}`} className="text-sm capitalize">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Label>
                    <Switch
                      id={`card-${key}`}
                      checked={value as boolean}
                      onCheckedChange={(checked) => handleSettingChange('card', ['card', key], checked)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Authentication */}
        <TabsContent value="authentication" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Controls</CardTitle>
              <CardDescription>
                Manage user authentication and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {authentication && Object.entries(authentication).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={`auth-${key}`} className="text-sm capitalize">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Label>
                  <Switch
                    id={`auth-${key}`}
                    checked={value as boolean}
                    onCheckedChange={(checked) => handleSettingChange('authentication', ['authentication', key], checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fees */}
        <TabsContent value="fees" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Transfer Fees</CardTitle>
                <CardDescription>
                  Configure transfer fee structure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {feesSettings?.transfers && Object.entries(feesSettings.transfers).map(([key, value]) => (
                  <div key={key} className="grid gap-2">
                    <Label className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                    <Input
                      type="number"
                      value={value as number}
                      onChange={(e) => handleSettingChange('fees', ['fees', 'transfers', key], parseFloat(e.target.value) || 0)}
                      step={key.includes('percentage') ? '0.01' : '1'}
                      className="h-8"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Card Fees</CardTitle>
                <CardDescription>
                  Set card-related fees and charges
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {feesSettings?.cards && Object.entries(feesSettings.cards).map(([key, value]) => (
                  <div key={key} className="grid gap-2">
                    <Label className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                    <Input
                      type="number"
                      value={value as number}
                      onChange={(e) => handleSettingChange('fees', ['fees', 'cards', key], parseFloat(e.target.value) || 0)}
                      step="0.01"
                      className="h-8"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Limits & Thresholds */}
        <TabsContent value="limits" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Wallet Tier Limits</CardTitle>
                <CardDescription>
                  Set transaction limits for different wallet tiers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {walletTiers && Object.entries(walletTiers).map(([tier, limits]) => (
                  <div key={tier} className="space-y-4">
                    <h4 className="font-medium text-sm">Tier {tier}</h4>
                    {Object.entries(limits as Record<string, number>).map(([limitType, value]) => (
                      <div key={limitType} className="grid gap-2">
                        <Label className="text-sm capitalize">{limitType.replace(/([A-Z])/g, ' $1')}</Label>
                        <Input
                          type="number"
                          value={value}
                          onChange={(e) => handleSettingChange('wallet_tiers', ['wallet_tiers', tier, limitType], parseInt(e.target.value) || 0)}
                          className="h-8"
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Balance Thresholds</CardTitle>
                <CardDescription>
                  Set minimum balance requirements for services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {thresholds && Object.entries(thresholds).map(([service, threshold]) => (
                  <div key={service} className="grid gap-2">
                    <Label className="text-sm capitalize">{service.replace(/([A-Z])/g, ' $1')}</Label>
                    <Input
                      type="number"
                      value={threshold as number}
                      onChange={(e) => handleSettingChange('service_balance_thresholds', ['service_balance_thresholds', service], parseInt(e.target.value) || 0)}
                      className="h-8"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}  