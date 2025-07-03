"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2, Settings2, Save, Network } from "lucide-react";
import { motion } from "framer-motion";
import { useServiceFeatures, useServiceOptions, useBatchUpdateSettings } from "@/hooks/use-admin";

interface FeatureSettings {
  id: string;
  name: string;
  properties: any;
}

interface ProviderOptions {
  providers: Record<string, { value: string; name: string; imageURL: string }>;
  options: {
    transfers: string[];
    bills: {
      airtime: string[];
      data: string[];
      cable_tv: string[];
      electricity: string[];
      betting: string[];
      airtime_to_cash: string[];
    };
    primary_wallet: string[];
  };
}

export default function ProvidersPage() {
  const [localFeatures, setLocalFeatures] = useState<FeatureSettings[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // React Query hooks
  const { 
    data: features, 
    isLoading: featuresLoading, 
    error: featuresError,
    refetch: refetchFeatures 
  } = useServiceFeatures();
  
  const { 
    data: providerOptions, 
    isLoading: optionsLoading, 
    error: optionsError 
  } = useServiceOptions();
  
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

  const getProviderDisplayName = (providerValue: string) => {
    if (!providerValue) return '';
    return providerOptions?.providers[providerValue]?.name || providerValue;
  };

  const findFeature = (id: string) => localFeatures.find((f: FeatureSettings) => f.id === id);

  const isLoading = featuresLoading || optionsLoading;
  const error = featuresError || optionsError;

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

  return (
    <div className="space-y-6 max-w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Provider Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure and manage service providers for all platform operations
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                Core Services
              </CardTitle>
              <CardDescription>
                Configure providers for essential financial services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Transfer Provider</Label>
                <Select
                  value={chosenProviders?.services?.transfer || ""}
                  onValueChange={(value) => handleSettingChange('chosen_providers', ['chosen_providers', 'services', 'transfer'], value)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select transfer provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {providerOptions?.options.transfers?.map((provider: string) => (
                      <SelectItem key={provider} value={provider}>
                        {getProviderDisplayName(provider)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label className="text-sm font-medium">Card Creation Provider</Label>
                <Select
                  value={chosenProviders?.card_creation?.provider || ""}
                  onValueChange={(value) => handleSettingChange('chosen_providers', ['chosen_providers', 'card_creation', 'provider'], value)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select card provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(providerOptions?.providers || {}).map((provider: string) => (
                      <SelectItem key={provider} value={provider}>
                        {getProviderDisplayName(provider)}
                      </SelectItem>
                    ))}
                    {/* Add current provider if it's not in the available options */}
                    {chosenProviders?.card_creation?.provider && 
                     !Object.keys(providerOptions?.providers || {}).includes(chosenProviders.card_creation.provider) && (
                      <SelectItem key={chosenProviders.card_creation.provider} value={chosenProviders.card_creation.provider}>
                        {chosenProviders.card_creation.provider} (Current)
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label className="text-sm font-medium">Primary Wallet Bank</Label>
                <Select
                  value={chosenProviders?.wallet_creation?.bank || ""}
                  onValueChange={(value) => handleSettingChange('chosen_providers', ['chosen_providers', 'wallet_creation', 'bank'], value)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select primary bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {providerOptions?.options.primary_wallet?.map((provider: string) => (
                      <SelectItem key={provider} value={provider}>
                        {getProviderDisplayName(provider)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Bills & Utilities
              </CardTitle>
              <CardDescription>
                Configure providers for bill payment and utility services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {['airtime', 'data', 'cable_tv', 'electricity', 'betting', 'airtime_to_cash'].map((service) => (
                <div key={service} className="grid gap-2">
                  <Label className="text-sm font-medium capitalize">
                    {service.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Label>
                  <Select
                    value={chosenProviders?.services?.bills?.[service] || ""}
                    onValueChange={(value) => handleSettingChange('chosen_providers', ['chosen_providers', 'services', 'bills', service], value)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder={`Select ${service.replace('_', ' ')} provider`} />
                    </SelectTrigger>
                    <SelectContent>
                      {providerOptions?.options.bills?.[service as keyof typeof providerOptions.options.bills]?.map((provider: string) => (
                        <SelectItem key={provider} value={provider}>
                          {getProviderDisplayName(provider)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Provider Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Provider Status Overview</CardTitle>
            <CardDescription>
              Current status of all configured providers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {chosenProviders && (
                <>
                  {/* Core Services Status */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm text-foreground border-b pb-2">Core Services</h4>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-muted-foreground">Transfer Service</Label>
                        <div className="px-3 py-2 bg-muted/50 rounded-md border text-sm">
                          {getProviderDisplayName(chosenProviders.services?.transfer) || 'Not configured'}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-muted-foreground">Card Creation</Label>
                        <div className="px-3 py-2 bg-muted/50 rounded-md border text-sm">
                          {getProviderDisplayName(chosenProviders.card_creation?.provider) || 'Not configured'}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-muted-foreground">Primary Wallet</Label>
                        <div className="px-3 py-2 bg-muted/50 rounded-md border text-sm">
                          {getProviderDisplayName(chosenProviders.wallet_creation?.bank) || 'Not configured'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bills Status */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm text-foreground border-b pb-2">Bill Payments</h4>
                    <div className="space-y-3">
                      {['airtime', 'data', 'cable_tv'].map((service) => (
                        <div key={service} className="space-y-1">
                          <Label className="text-xs font-medium text-muted-foreground capitalize">
                            {service.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Label>
                          <div className="px-3 py-2 bg-muted/50 rounded-md border text-sm">
                            {getProviderDisplayName(chosenProviders.services?.bills?.[service]) || 'Not configured'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Utilities Status */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm text-foreground border-b pb-2">Utilities & Others</h4>
                    <div className="space-y-3">
                      {['electricity', 'betting', 'airtime_to_cash'].map((service) => (
                        <div key={service} className="space-y-1">
                          <Label className="text-xs font-medium text-muted-foreground capitalize">
                            {service.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Label>
                          <div className="px-3 py-2 bg-muted/50 rounded-md border text-sm">
                            {getProviderDisplayName(chosenProviders.services?.bills?.[service]) || 'Not configured'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
} 