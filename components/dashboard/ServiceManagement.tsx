"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import axios from "axios";

interface ServiceData {
  name: string;
  key: string;
  isAvailable: boolean;
  providers: string[];
  currentProvider: string;
}

interface FeatureData {
  chosen_providers: any;
  airtimeAndData: any;
  bills: any;
  wallet: any;
}

interface ProviderOptions {
  providers: Record<string, { value: string; name: string; imageURL: string }>;
  options: {
    transfers: string[];
    bills: {
      airtime: string[];
      data: string[];
      airtime_to_cash: string[];
    };
  };
}

export default function ServiceManagement() {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [featureData, setFeatureData] = useState<FeatureData | null>(null);
  const [providerOptions, setProviderOptions] = useState<ProviderOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found');
      setLoading(false);
      return;
    }

    try {
      const [featuresResponse, optionsResponse] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/control-panel/get-features`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/control-panel/options`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (featuresResponse.data.success && optionsResponse.data.success) {
        const features = featuresResponse.data.data;
        const options = optionsResponse.data.data;
        
        // Extract relevant feature data
        const chosenProviders = features.find((f: any) => f.id === 'chosen_providers')?.properties?.chosen_providers;
        const airtimeAndData = features.find((f: any) => f.id === 'airtimeAndData')?.properties?.airtimeAndData;
        const bills = features.find((f: any) => f.id === 'bills')?.properties?.bills;
        const wallet = features.find((f: any) => f.id === 'wallet')?.properties?.wallet;

        setFeatureData({ chosen_providers: chosenProviders, airtimeAndData, bills, wallet });
        setProviderOptions(options);

        // Build services array for quick controls
        const quickServices: ServiceData[] = [
          {
            name: "Transfers",
            key: "transfer",
            isAvailable: true, // Always available
            providers: options.options.transfers || [],
            currentProvider: chosenProviders?.services?.transfer || ""
          },
          {
            name: "Airtime Purchase", 
            key: "airtime",
            isAvailable: airtimeAndData?.allowBuyAirtime || false,
            providers: options.options.bills?.airtime || [],
            currentProvider: chosenProviders?.services?.bills?.airtime || ""
          },
          {
            name: "Data Purchase",
            key: "data", 
            isAvailable: airtimeAndData?.allowBuyData || false,
            providers: options.options.bills?.data || [],
            currentProvider: chosenProviders?.services?.bills?.data || ""
          },
          {
            name: "Airtime to Cash",
            key: "airtime_to_cash",
            isAvailable: airtimeAndData?.allowAirtimeToCash || false,
            providers: options.options.bills?.airtime_to_cash || [],
            currentProvider: chosenProviders?.services?.bills?.airtime_to_cash || ""
          }
        ];

        setServices(quickServices);
        setError(null);
      } else {
        throw new Error('Failed to fetch data');
      }
    } catch (err: any) {
      console.error('ServiceManagement fetch error:', err);
      setError(err.response?.data?.message || 'Failed to fetch service data');
    } finally {
      setLoading(false);
    }
  };

  const handleAvailabilityChange = async (serviceKey: string, checked: boolean) => {
    // Update local state immediately
    setServices(prev => 
      prev.map(service => 
        service.key === serviceKey ? { ...service, isAvailable: checked } : service
      )
    );

    // Save to backend
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      let settingsId = '';
      let properties = {};

      if (serviceKey === 'airtime') {
        settingsId = 'airtimeAndData';
        properties = { allowBuyAirtime: checked };
      } else if (serviceKey === 'data') {
        settingsId = 'airtimeAndData';
        properties = { allowBuyData: checked };
      } else if (serviceKey === 'airtime_to_cash') {
        settingsId = 'airtimeAndData';
        properties = { allowAirtimeToCash: checked };
      }

      if (settingsId) {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/control-panel/update-settings`,
          { settings_id: settingsId, properties },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (err: any) {
      console.error('Failed to update availability:', err);
      // Revert local state on error
      setServices(prev => 
        prev.map(service => 
          service.key === serviceKey ? { ...service, isAvailable: !checked } : service
        )
      );
    }
  };

  const handleProviderChange = async (serviceKey: string, provider: string) => {
    // Update local state immediately
    setServices(prev => 
      prev.map(service => 
        service.key === serviceKey ? { ...service, currentProvider: provider } : service
      )
    );

    // Save to backend
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      let properties = {};
      
      if (serviceKey === 'transfer') {
        properties = { 
          services: { 
            ...featureData?.chosen_providers?.services,
            transfer: provider 
          }
        };
      } else {
        properties = {
          services: {
            ...featureData?.chosen_providers?.services,
            bills: {
              ...featureData?.chosen_providers?.services?.bills,
              [serviceKey]: provider
            }
          }
        };
      }

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/control-panel/update-settings`,
        { settings_id: 'chosen_providers', properties },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update featureData to keep it in sync
      if (featureData) {
        const updatedFeatureData = { ...featureData };
        if (serviceKey === 'transfer') {
          updatedFeatureData.chosen_providers.services.transfer = provider;
        } else {
          updatedFeatureData.chosen_providers.services.bills[serviceKey] = provider;
        }
        setFeatureData(updatedFeatureData);
      }
    } catch (err: any) {
      console.error('Failed to update provider:', err);
      // Could revert state here, but for UX we'll leave the optimistic update
    }
  };

  const getProviderDisplayName = (providerValue: string) => {
    return providerOptions?.providers[providerValue]?.name || providerValue;
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg shadow-sm overflow-hidden border border-border/40">
        <div className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card rounded-lg shadow-sm overflow-hidden border border-border/40">
        <div className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={fetchData} variant="outline" className="mt-4 w-full">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-sm overflow-hidden border border-border/40">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Service Management</h2>
        </div>

        {success && (
          <Alert className="mb-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              {success}
            </AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="availability" className="space-y-6">
          <TabsList>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="provider">Provider</TabsTrigger>
          </TabsList>

          <TabsContent value="availability" className="space-y-6">
            {services.map((service) => (
              <div key={service.key} className="flex items-center justify-between">
                <Label htmlFor={`${service.key}-switch`}>{service.name}</Label>
                <Switch
                  id={`${service.key}-switch`}
                  checked={service.isAvailable}
                  onCheckedChange={(checked) => handleAvailabilityChange(service.key, checked)}
                  disabled={service.key === 'transfer'} // Transfers always available
                />
              </div>
            ))}
          </TabsContent>

          <TabsContent value="provider" className="space-y-6">
            {services.map((service) => (
              <div key={service.key} className="grid gap-2">
                <Label htmlFor={`${service.key}-provider`}>{service.name}</Label>
                <Select
                  value={service.currentProvider}
                  onValueChange={(provider) => handleProviderChange(service.key, provider)}
                >
                  <SelectTrigger id={`${service.key}-provider`}>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {service.providers.map((providerValue) => (
                      <SelectItem key={providerValue} value={providerValue}>
                        {getProviderDisplayName(providerValue)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}