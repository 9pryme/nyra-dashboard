"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Search, AlertCircle, CheckCircle, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NotificationHistoryTable from "./NotificationHistoryTable";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUsers } from "@/hooks/use-users";

// Define the notification interface
interface Notification {
  id: string;
  title: string;
  date: string;
  type: string;
  sentTo: string;
}

interface User {
  email: string;
  username?: string;
  user_id: string;
  firstname: string;
  lastname: string;
  phone_number: string;
  role: string;
  active_status: string;
  created_at: string;
  updated_at: string;
}

export default function PushNotifications() {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [recipientType, setRecipientType] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [displayedUsers, setDisplayedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openCombobox, setOpenCombobox] = useState(false);
  const [sendingStatus, setSendingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const commandListRef = useRef<HTMLDivElement>(null);
  
  // Notification history state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Function to get API base URL and token
  const getApiConfig = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    if (!apiUrl) {
      throw new Error('API URL not configured');
    }

    return { token, apiUrl };
  }, []);

  // Fetch notification history data
  const fetchNotificationHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    setHistoryError(null);
    
    try {
      const { token, apiUrl } = getApiConfig();
      
      console.log('Fetching notification history...');
      
      // Replace with your actual API endpoint for notification history
      const response = await axios.get(`${apiUrl}/notifications/admin/history`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        // Transform API response to match the Notification interface
        const formattedNotifications = response.data.data.map((item: any) => ({
          id: item.id || item.notification_id,
          title: item.title,
          date: new Date(item.created_at || item.sent_at).toLocaleString(),
          type: item.users_type === 'ALL_USERS' ? 'all' : 'specific',
          sentTo: item.users_type === 'ALL_USERS' ? 'All Users' : (item.user_email || item.recipient || 'Specific User')
        }));
        
        setNotifications(formattedNotifications);
        console.log(`Loaded ${formattedNotifications.length} notifications`);
      } else {
        console.warn("No notification history data returned or invalid format");
        // If the API isn't implemented yet, use sample data
        setNotifications([
          {
            id: "1",
            title: "New Feature Available",
            date: "2024-03-20 14:30",
            type: "all",
            sentTo: "All Users",
          },
          {
            id: "2",
            title: "Account Update Required",
            date: "2024-03-19 10:15",
            type: "single",
            sentTo: "John Doe",
          },
          {
            id: "3",
            title: "Transaction Successful",
            date: "2024-03-18 16:45",
            type: "specific",
            sentTo: "Premium Users",
          },
        ]);
      }
    } catch (error: any) {
      console.error("Error fetching notification history:", error);
      setHistoryError("Failed to load notification history");
      
      // If API fails, use sample data
      setNotifications([
        {
          id: "1",
          title: "New Feature Available",
          date: "2024-03-20 14:30",
          type: "all",
          sentTo: "All Users",
        },
        {
          id: "2",
          title: "Account Update Required",
          date: "2024-03-19 10:15",
          type: "single",
          sentTo: "John Doe",
        },
        {
          id: "3",
          title: "Transaction Successful",
          date: "2024-03-18 16:45",
          type: "specific",
          sentTo: "Premium Users",
        },
      ]);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [getApiConfig]);

  // Use React Query to fetch users (always fetched for caching, but only used when specific is selected)
  const { data: allUsersData = [], isLoading: isLoadingUsersQuery, error: usersError } = useUsers();

  // Update local state when users data changes
  useEffect(() => {
    if (recipientType !== "specific") return;
    
    setIsLoadingUsers(isLoadingUsersQuery);
    
    if (allUsersData.length > 0) {
      // Sort users alphabetically by name
      const sortedUsers = [...allUsersData].sort((a, b) => 
        `${a.firstname} ${a.lastname}`.localeCompare(`${b.firstname} ${b.lastname}`)
      );
      
      setAllUsers(sortedUsers);
      setFilteredUsers(sortedUsers);
      setDisplayedUsers(sortedUsers.slice(0, itemsPerPage));
      setError(null);
      
      console.log(`Loaded ${sortedUsers.length} users`);
    } else if (usersError) {
      setError("Failed to load users. Please try again.");
      setAllUsers([]);
      setFilteredUsers([]);
      setDisplayedUsers([]);
    }
  }, [allUsersData, recipientType, usersError, isLoadingUsersQuery]);

  // Fetch notification history when component mounts
  useEffect(() => {
    fetchNotificationHistory();
  }, [fetchNotificationHistory]);

  // Filter users based on search query
  useEffect(() => {
    if (allUsers.length === 0) return;

    // Reset pagination when search query changes
    setCurrentPage(0);

    if (!searchQuery.trim()) {
      setFilteredUsers(allUsers);
      setDisplayedUsers(allUsers.slice(0, itemsPerPage));
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = allUsers.filter(user => 
      user.email?.toLowerCase().includes(query) || 
      user.firstname?.toLowerCase().includes(query) || 
      user.lastname?.toLowerCase().includes(query) ||
      user.phone_number?.includes(query) ||
      (user.username && user.username.toLowerCase().includes(query))
    );

    setFilteredUsers(filtered);
    setDisplayedUsers(filtered.slice(0, itemsPerPage));
    
    console.log(`Filtered to ${filtered.length} users matching "${query}"`);
  }, [searchQuery, allUsers]);

  // Handle scroll in the command list
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (!commandListRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 30;
    
    // Check if scrolled near the bottom
    if (isNearBottom) {
      const nextPage = currentPage + 1;
      const startIndex = nextPage * itemsPerPage;
      
      if (startIndex < filteredUsers.length) {
        console.log(`Loading more users: ${displayedUsers.length} → ${startIndex + itemsPerPage}`);
        const nextItems = filteredUsers.slice(0, startIndex + itemsPerPage);
        setDisplayedUsers(nextItems);
        setCurrentPage(nextPage);
      }
    }
  }, [currentPage, filteredUsers, displayedUsers.length, itemsPerPage]);

  const selectUser = useCallback((user: User) => {
    setSelectedUser(user);
    setOpenCombobox(false);
    
    toast({
      title: "User Selected",
      description: `${user.firstname} ${user.lastname} (${user.email}) selected for notification.`,
      duration: 2000,
    });
    
    console.log('Selected user:', user);
  }, [toast]);

  const handleSend = async () => {
    if (!title || !body) {
      toast({
        variant: "destructive",
        title: "Incomplete Form",
        description: "Please enter both title and message.",
      });
      return;
    }

    if (recipientType === "specific" && !selectedUser) {
      toast({
        variant: "destructive",
        title: "No User Selected",
        description: "Please select a user to send the notification to.",
      });
      return;
    }

    setSendingStatus('loading');
    setLoading(true);

    try {
      const { token, apiUrl } = getApiConfig();

      let response;
      if (recipientType === "all") {
        // Send to all users
        console.log("Sending notification to all users");
        response = await axios.post(
          `${apiUrl}/notifications/admin/send-push`,
          {
            users_type: "ALL_USERS",
            title,
            body
          },
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            } 
          }
        );
      } else if (recipientType === "specific" && selectedUser) {
        // Send to specific user
        console.log(`Sending notification to specific user: ${selectedUser.email}`);
        response = await axios.post(
          `${apiUrl}/notifications/admin/user/send-push`,
          {
            email: selectedUser.email,
            title,
            body
          },
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            } 
          }
        );
      }

      console.log("API response:", response?.data);

      if (response && response.data && response.data.success) {
        setSendingStatus('success');
        toast({
          title: "Notification Sent",
          description: recipientType === "all" 
            ? "Push notification sent to all users." 
            : `Push notification sent to ${selectedUser?.firstname} ${selectedUser?.lastname}.`,
        });

        // Add the new notification to the history list
        const newNotification = {
          id: response.data.data?.id || Date.now().toString(),
          title,
          date: new Date().toLocaleString(),
          type: recipientType,
          sentTo: recipientType === "all" 
            ? "All Users" 
            : `${selectedUser?.firstname} ${selectedUser?.lastname}`
        };
        
        setNotifications(prev => [newNotification, ...prev]);

        // Reset form after successful send
        setTitle("");
        setBody("");
        setRecipientType("all");
        setSelectedUser(null);
        setSearchQuery("");
      } else {
        setSendingStatus('error');
        throw new Error(response?.data?.error || "Failed to send notification");
      }
    } catch (error: any) {
      setSendingStatus('error');
      console.error("Error sending notification:", error);
      
      let errorMessage = "There was an error sending the notification. Please try again.";
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        variant: "destructive",
        title: "Failed to Send",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
      // Reset status after 3 seconds
      setTimeout(() => setSendingStatus('idle'), 3000);
    }
  };

  const handleResend = async (id: string) => {
    // Find the notification to resend
    const notificationToResend = notifications.find(n => n.id === id);
    if (!notificationToResend) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Notification not found",
      });
      return;
    }

    // Set form values for resending
    setTitle(notificationToResend.title);
    setRecipientType(notificationToResend.type);
    
    // Scroll to the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    toast({
      title: "Notification Loaded",
      description: "You can now edit and resend this notification.",
    });
  };

  const handleDelete = async (id: string) => {
    try {
      const { token, apiUrl } = getApiConfig();
      
      // In a real implementation, you'd call the API to delete the notification
      // For now, we'll just remove it from the local state
      console.log("Deleting notification:", id);
      
      // Remove the notification from the list
      setNotifications(prev => prev.filter(n => n.id !== id));
      
      toast({
        title: "Notification Deleted",
        description: "The notification has been removed from history.",
      });
      
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "Failed to delete the notification. Please try again.",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Send Push Notification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sendingStatus === 'success' && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Success</AlertTitle>
                <AlertDescription className="text-green-700">
                  Notification sent successfully!
                </AlertDescription>
              </Alert>
            )}

            {sendingStatus === 'error' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Failed to send notification. Please try again.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                placeholder="Enter notification title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea
                placeholder="Enter notification message"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Send To</label>
              <Select 
                value={recipientType} 
                onValueChange={(value) => {
                  setRecipientType(value);
                  setError(null);
                  setSelectedUser(null);
                  setSearchQuery('');
                  setCurrentPage(0);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="specific">Specific User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {recipientType === "specific" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Select User</label>
                {selectedUser ? (
                  <div className="flex items-center justify-between p-2 border rounded-md">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{selectedUser.firstname} {selectedUser.lastname}</p>
                        <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedUser(null)}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openCombobox}
                        className="w-full justify-between"
                      >
                        <span>Select user...</span>
                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="start">
                      <Command>
                        <CommandInput 
                          placeholder="Search name, email, phone..." 
                          value={searchQuery}
                          onValueChange={setSearchQuery}
                        />
                        <div 
                          className="max-h-[300px] overflow-y-auto" 
                          onScroll={handleScroll} 
                          ref={commandListRef}
                        >
                          {isLoadingUsers ? (
                            <div className="flex items-center justify-center p-4">
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              <span>Loading users...</span>
                            </div>
                          ) : error ? (
                            <div className="p-4 text-sm text-red-500">
                              {error}
                            </div>
                          ) : (
                            <>
                              {filteredUsers.length === 0 ? (
                                <CommandEmpty>No users found</CommandEmpty>
                              ) : (
                                <CommandGroup>
                                  {displayedUsers.map((user) => (
                                    <CommandItem
                                      key={user.user_id}
                                      value={user.user_id}
                                      onSelect={() => selectUser(user)}
                                      className="cursor-pointer"
                                    >
                                      <div className="flex flex-col">
                                        <span className="font-medium">{user.firstname} {user.lastname}</span>
                                        <span className="text-xs text-muted-foreground">{user.email}</span>
                                      </div>
                                    </CommandItem>
                                  ))}
                                  {displayedUsers.length < filteredUsers.length && (
                                    <div className="py-2 text-center text-xs text-muted-foreground">
                                      Scroll for more users
                                    </div>
                                  )}
                                </CommandGroup>
                              )}
                            </>
                          )}
                        </div>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
                
                {filteredUsers.length > 0 && !selectedUser && (
                  <p className="text-xs text-muted-foreground">
                    Showing {displayedUsers.length} of {filteredUsers.length} users
                  </p>
                )}
              </div>
            )}

            <Button 
              onClick={handleSend} 
              className="w-full" 
              disabled={loading || (recipientType === "specific" && !selectedUser)}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Notification
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingHistory ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Loading notification history...</span>
            </div>
          ) : historyError ? (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{historyError}</AlertDescription>
            </Alert>
          ) : (
            <NotificationHistoryTable
              notifications={notifications}
              onResend={handleResend}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
} 