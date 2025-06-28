"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Calendar,
  Phone,
  MapPin,
  CreditCard,
  Copy,
  Check,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiCache } from "@/lib/cache";
import axios from "axios";

interface KycRecord {
  id: string;
  id_type: string;
  status: string;
  next_step: string;
  value: string;
  identity_data: {
    dob: string;
    nin?: string;
    bvn?: string;
    type: string;
    title: string;
    gender: string;
    last_name: string;
    first_name: string;
    middle_name: string;
    nationality: string;
    phone_number: string;
    base_64_image: string;
    marital_status: string;
    street_address: string;
    state_of_origin: string;
    lga_of_residence: string;
    state_of_residence: string;
  };
  meta?: {
    masked_phone_number?: string;
  };
}

interface UserKycModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

export default function UserKycModal({ isOpen, onClose, userId, userName }: UserKycModalProps) {
  const [kycData, setKycData] = useState<KycRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && userId) {
      fetchKycData();
    }
  }, [isOpen, userId]);

  const fetchKycData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await apiCache.getOrFetch<any>(
        `kyc_data_${userId}`,
        async () => {
          const axiosResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/admin/identities/user/kyc/${userId}`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          return axiosResponse.data;
        },
        300000 // 5 minutes cache
      );

      if (response.success && response.data) {
        setKycData(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch KYC data');
      }
    } catch (err: any) {
      console.error('KYC fetch error:', err);
      setError(err.message || 'Failed to load KYC data');
      toast({
        title: "Error",
        description: "Failed to load KYC information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`,
    });
    
    const itemKey = `${label}-${text}`;
    setCopiedItems(prev => new Set(prev).add(itemKey));
    
    // Revert back to copy icon after 2 seconds
    setTimeout(() => {
      setCopiedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }, 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed':
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'verified':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
        <SheetHeader className="space-y-3">
          <SheetTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            KYC Documentation
          </SheetTitle>
          <SheetDescription>
            Identity verification documents for {userName}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading KYC information...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <XCircle className="h-8 w-8 mx-auto text-red-500" />
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button variant="outline" size="sm" onClick={fetchKycData}>
                  Try Again
                </Button>
              </div>
            </div>
          ) : kycData.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <FileText className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No KYC documents found</p>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {kycData.map((record, index) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <CreditCard className="h-5 w-5" />
                          {record.id_type} Verification
                        </CardTitle>
                        <Badge variant={getStatusBadgeVariant(record.status)} className="flex items-center gap-1">
                          {getStatusIcon(record.status)}
                          {record.status.toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* ID Number */}
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{record.id_type} Number</p>
                          <p className="text-lg font-mono">{record.value}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(record.value, record.id_type)}
                        >
                          {copiedItems.has(`${record.id_type}-${record.value}`) ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      <Separator />

                      {/* Personal Information */}
                      <div className="space-y-3">
                        <h4 className="font-medium flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Personal Information
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Full Name</p>
                            <p className="font-medium">
                              {record.identity_data.title}. {record.identity_data.first_name} {record.identity_data.middle_name} {record.identity_data.last_name}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Gender</p>
                            <p className="font-medium capitalize">{record.identity_data.gender}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Date of Birth</p>
                            <p className="font-medium flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(record.identity_data.dob)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Marital Status</p>
                            <p className="font-medium capitalize">{record.identity_data.marital_status}</p>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Contact Information */}
                      <div className="space-y-3">
                        <h4 className="font-medium flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Contact Information
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-muted-foreground">Phone Number</p>
                              <p className="font-medium">{record.identity_data.phone_number}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(record.identity_data.phone_number, 'Phone number')}
                            >
                              {copiedItems.has(`Phone number-${record.identity_data.phone_number}`) ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          {record.meta?.masked_phone_number && (
                            <div>
                              <p className="text-muted-foreground">Masked Phone</p>
                              <p className="font-medium">{record.meta.masked_phone_number}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <Separator />

                      {/* Location Information */}
                      <div className="space-y-3">
                        <h4 className="font-medium flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Location Information
                        </h4>
                        <div className="grid grid-cols-1 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground">Address</p>
                            <p className="font-medium">{record.identity_data.street_address}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-muted-foreground">State of Origin</p>
                              <p className="font-medium">{record.identity_data.state_of_origin}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">State of Residence</p>
                              <p className="font-medium">{record.identity_data.state_of_residence}</p>
                            </div>
                          </div>
                          {record.identity_data.lga_of_residence && (
                            <div>
                              <p className="text-muted-foreground">LGA of Residence</p>
                              <p className="font-medium">{record.identity_data.lga_of_residence}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-muted-foreground">Nationality</p>
                            <p className="font-medium">{record.identity_data.nationality}</p>
                          </div>
                        </div>
                      </div>

                      {/* Next Steps */}
                      {record.next_step && (
                        <>
                          <Separator />
                          <div className="space-y-2">
                            <h4 className="font-medium">Next Steps</h4>
                            <p className="text-sm text-muted-foreground">{record.next_step}</p>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
} 