import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, UserPlus, Loader2, CheckCircle, XCircle, AlertCircle, Search } from 'lucide-react';
import { studentService } from '@/lib/services';
import type { DbStudent } from '@/types/database-models';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export function StudentsDetailsPage() {
  const [students, setStudents] = useState<DbStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Form data for adding student
  const [formData, setFormData] = useState({
    register_number: '',
    full_name: '',
    email: '',
    phone: '',
    hostel_status: 'resident' as 'resident' | 'day_scholar' | 'former_resident',
    is_active: true,
  });

  // Load students from Supabase
  const loadStudents = async () => {
    console.log('🔵 [STUDENTS_DETAILS] ========================================');
    console.log('🔵 [STUDENTS_DETAILS] Starting to load students...');
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔵 [STUDENTS_DETAILS] Step 1: Checking environment variables...');
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      console.log('🔵 [STUDENTS_DETAILS] Environment check:', {
        urlExists: !!supabaseUrl,
        urlPrefix: supabaseUrl?.substring(0, 30) || 'MISSING',
        keyExists: !!supabaseKey,
        keyPrefix: supabaseKey?.substring(0, 20) || 'MISSING'
      });

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase environment variables');
      }

      console.log('🔵 [STUDENTS_DETAILS] Step 2: Testing with simplest query first...');
      
      // Test 1: Try the absolute simplest query (just count)
      console.log('🔵 [STUDENTS_DETAILS] Test 1: Simple count query...');
      try {
        const { count, error: countError } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true });
        
        console.log('🔵 [STUDENTS_DETAILS] Count result:', { count, hasError: !!countError });
        if (countError) {
          console.error('❌ [STUDENTS_DETAILS] Count error:', countError);
          throw new Error(`Count query failed: ${countError.message} (Code: ${countError.code})`);
        }
        console.log(`✅ [STUDENTS_DETAILS] Count successful! Total students: ${count}`);
      } catch (countErr) {
        console.error('❌ [STUDENTS_DETAILS] Count test failed:', countErr);
        throw countErr;
      }

      // Test 2: Try selecting just one field
      console.log('🔵 [STUDENTS_DETAILS] Test 2: Selecting only id (one field)...');
      let testData: any = null;
      let testError: any = null;
      const testStartTime = Date.now();
      
      try {
        const { data: idData, error: idError } = await supabase
          .from('students')
          .select('id')
          .limit(5);
        
        console.log('🔵 [STUDENTS_DETAILS] ID-only query result:', {
          hasData: !!idData,
          dataLength: Array.isArray(idData) ? idData.length : 'N/A',
          hasError: !!idError
        });
        
        if (idError) {
          console.error('❌ [STUDENTS_DETAILS] ID-only error:', {
            message: idError.message,
            details: idError.details,
            hint: idError.hint,
            code: idError.code
          });
          throw idError;
        }
        
        console.log('✅ [STUDENTS_DETAILS] ID-only query successful!');
      } catch (idErr) {
        console.error('❌ [STUDENTS_DETAILS] ID-only test failed:', idErr);
        testError = idErr;
        throw idErr;
      }

      // Test 3: Now try with face_embedding filter
      console.log('🔵 [STUDENTS_DETAILS] Test 3: Fetching students with face_embedding...');
      
      try {
        console.log('🔵 [STUDENTS_DETAILS] Building query for students with face_embedding...');
        const testQuery = supabase
          .from('students')
          .select('id, register_number, full_name, email, phone, hostel_status, room_number, is_active, created_at, updated_at, face_embedding')
          .not('face_embedding', 'is', null)
          .order('created_at', { ascending: false })
          .limit(300);

        console.log('🔵 [STUDENTS_DETAILS] Query built, executing...');
        
        const { data, error } = await testQuery;
        
        testData = data;
        testError = error;
        
        const testTime = Date.now() - testStartTime;
        
        console.log('🔵 [STUDENTS_DETAILS] Query completed:', {
          hasData: !!testData,
          hasError: !!testError,
          dataLength: Array.isArray(testData) ? testData.length : 'N/A',
          time: `${testTime}ms`
        });
        
        if (testError) {
          console.error('❌ [STUDENTS_DETAILS] Query error details:', {
            message: testError.message,
            details: testError.details,
            hint: testError.hint,
            code: testError.code,
            status: (testError as any).status
          });
          
          // Provide helpful error messages based on error code
          if (testError.code === 'PGRST116' || testError.message.includes('permission denied')) {
            console.error('🚫 [STUDENTS_DETAILS] RLS POLICY ERROR:');
            console.error('   The Row Level Security policy is blocking this query.');
            console.error('   Go to Supabase Dashboard → Authentication → Policies');
            console.error('   Add a SELECT policy for the students table');
            throw new Error('RLS Policy Error: Permission denied. Check Row Level Security policies in Supabase.');
          }
          
          throw testError;
        }
      } catch (err) {
        console.error('❌ [STUDENTS_DETAILS] Query exception:', err);
        testError = err instanceof Error ? err : new Error(String(err));
        if (!testError.message.includes('RLS')) {
          throw testError;
        }
      }
      
      const testTime = Date.now() - testStartTime;

      console.log('🔵 [STUDENTS_DETAILS] Direct query result:', {
        hasData: !!testData,
        dataLength: Array.isArray(testData) ? testData.length : 'N/A',
        hasError: !!testError,
        time: `${testTime}ms`
      });

      if (testError) {
        console.error('❌ [STUDENTS_DETAILS] Direct query error:', testError);
        throw testError;
      }

      if (!testData || !Array.isArray(testData)) {
        throw new Error('Invalid data format received from Supabase');
      }

      console.log('✅ [STUDENTS_DETAILS] Direct query successful!');
      console.log('✅ [STUDENTS_DETAILS] Students received:', testData.length);
      if (testData.length > 0) {
        console.log('✅ [STUDENTS_DETAILS] First student sample:', {
          id: testData[0].id,
          register_number: testData[0].register_number,
          full_name: testData[0].full_name,
          email: testData[0].email
        });
      }

      // Map to DbStudent format - keep face_embedding if it exists
      const mappedStudents: DbStudent[] = testData.map((student) => ({
        ...student,
        face_embedding: student.face_embedding || null,
        profile_image_url: null
      }));

      setStudents(mappedStudents);
      setError(null);
      toast.success(`Loaded ${mappedStudents.length} students successfully!`);
      console.log('✅ [STUDENTS_DETAILS] State updated with', mappedStudents.length, 'students');

      // Now try using the service
      console.log('🔵 [STUDENTS_DETAILS] Step 3: Testing via studentService...');
      try {
        const serviceStartTime = Date.now();
        const serviceStudents = await studentService.getStudents(2);
        const serviceTime = Date.now() - serviceStartTime;
        console.log('✅ [STUDENTS_DETAILS] Service call successful:', {
          count: serviceStudents.length,
          time: `${serviceTime}ms`
        });
      } catch (serviceError) {
        console.warn('⚠️ [STUDENTS_DETAILS] Service call failed:', serviceError);
        // Don't throw - we already have data from direct query
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load students';
      console.error('❌ [STUDENTS_DETAILS] Error loading students:', err);
      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
      console.log('🔵 [STUDENTS_DETAILS] Loading completed');
      console.log('🔵 [STUDENTS_DETAILS] ========================================');
    }
  };

  // Load students on mount
  useEffect(() => {
    loadStudents();
  }, []);

  // Handle adding student
  const handleAddStudent = async () => {
    if (!formData.register_number || !formData.full_name) {
      toast.error('Register number and full name are required');
      return;
    }

    setIsAdding(true);
    console.log('🔵 [STUDENTS_DETAILS] Adding student...', formData);

    try {
      const newStudent = await studentService.createStudent({
        register_number: formData.register_number,
        full_name: formData.full_name,
        email: formData.email || null,
        phone: formData.phone || null,
        hostel_status: formData.hostel_status,
        room_number: null,
        face_embedding: null,
        profile_image_url: null,
        is_active: formData.is_active,
      });

      console.log('✅ [STUDENTS_DETAILS] Student added:', newStudent);
      
      // Refresh the list
      await loadStudents();
      
      setIsAddDialogOpen(false);
      setFormData({
        register_number: '',
        full_name: '',
        email: '',
        phone: '',
        hostel_status: 'resident',
        is_active: true,
      });
      
      toast.success(`Student "${newStudent.full_name}" added successfully!`);
    } catch (err) {
      console.error('❌ [STUDENTS_DETAILS] Error adding student:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add student';
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsAdding(false);
    }
  };

  // Search students in database
  const searchStudents = async (searchQuery: string) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      toast.warning('Please enter at least 2 characters to search');
      return;
    }

    setIsSearching(true);
    console.log('🔍 [STUDENTS_DETAILS] Searching for:', searchQuery);

    try {
      const { data, error } = await supabase
        .from('students')
        .select('id, register_number, full_name, email, phone, hostel_status, room_number, is_active, created_at, updated_at, face_embedding')
        .or(`full_name.ilike.%${searchQuery}%,register_number.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
        .not('face_embedding', 'is', null)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('❌ [STUDENTS_DETAILS] Search error:', error);
        throw error;
      }

      console.log('✅ [STUDENTS_DETAILS] Search results:', data?.length || 0);
      
      const mappedStudents: DbStudent[] = (data || []).map((student) => ({
        ...student,
        face_embedding: null,
        profile_image_url: null
      }));

      setStudents(mappedStudents);
      toast.success(`Found ${mappedStudents.length} students matching "${searchQuery}"`);
    } catch (err) {
      console.error('❌ [STUDENTS_DETAILS] Search failed:', err);
      toast.error('Search failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Students Details (Test Page)</h1>
            <p className="text-muted-foreground mt-1">
              Fetching only students with face recognition registered (face_embedding not null)
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, register number, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    searchStudents(searchTerm);
                  }
                }}
                className="pl-9"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => searchStudents(searchTerm)}
              disabled={isSearching || !searchTerm.trim()}
            >
              {isSearching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
            {searchTerm && (
              <Button 
                variant="ghost" 
                onClick={() => {
                  setSearchTerm('');
                  loadStudents();
                }}
              >
                Clear
              </Button>
            )}
            <Button variant="outline" onClick={loadStudents} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Refresh'
              )}
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Student</DialogTitle>
                  <DialogDescription>
                    Add a new student to test database insertion
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Register Number *</label>
                    <Input
                      placeholder="REG001"
                      value={formData.register_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, register_number: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Full Name *</label>
                    <Input
                      placeholder="John Doe"
                      value={formData.full_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <Input
                      placeholder="+1234567890"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddStudent} disabled={isAdding}>
                    {isAdding ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Student'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading...
                </>
              ) : error ? (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  Error
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Connected
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading students from database...</p>
            ) : error ? (
              <div className="space-y-2">
                <p className="text-red-600 font-medium">{error}</p>
                <Button onClick={loadStudents} variant="outline" size="sm">
                  Retry
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-green-600 font-medium">
                  Successfully connected to Supabase!
                </p>
                <p className="text-sm text-muted-foreground">
                  Found {students.length} students in database
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Students ({students.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <p className="text-red-600 font-medium mb-2">{error}</p>
                <Button onClick={loadStudents} variant="outline">
                  Retry
                </Button>
              </div>
            ) : students.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No students found</p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add First Student
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Register Number</TableHead>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Hostel Status</TableHead>
                      <TableHead>Room Number</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead>Face Recognition</TableHead>
                      <TableHead>Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-mono text-sm">
                          {student.register_number}
                        </TableCell>
                        <TableCell className="font-medium">
                          {student.full_name}
                        </TableCell>
                        <TableCell>{student.email || '-'}</TableCell>
                        <TableCell>{student.phone || '-'}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                            {student.hostel_status}
                          </span>
                        </TableCell>
                        <TableCell>{student.room_number || '-'}</TableCell>
                        <TableCell>
                          {student.is_active ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </TableCell>
                        <TableCell>
                          {student.face_embedding ? (
                            <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                              ✓ Registered
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                              Not Set
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(student.created_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Debug Info */}
        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 font-mono text-xs">
              <div>
                <span className="font-semibold">Supabase URL:</span>{' '}
                {import.meta.env.VITE_SUPABASE_URL ? (
                  <span className="text-green-600">
                    ✓ {import.meta.env.VITE_SUPABASE_URL.substring(0, 30)}...
                  </span>
                ) : (
                  <span className="text-red-600">✗ Missing</span>
                )}
              </div>
              <div>
                <span className="font-semibold">Supabase Key:</span>{' '}
                {import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? (
                  <span className="text-green-600">
                    ✓ Present ({import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY.length} chars)
                  </span>
                ) : (
                  <span className="text-red-600">✗ Missing</span>
                )}
              </div>
              <div>
                <span className="font-semibold">Students Loaded:</span>{' '}
                <span className="text-blue-600">{students.length}</span>
              </div>
              <div>
                <span className="font-semibold">Status:</span>{' '}
                {isLoading ? (
                  <span className="text-yellow-600">Loading...</span>
                ) : error ? (
                  <span className="text-red-600">Error: {error}</span>
                ) : (
                  <span className="text-green-600">Ready</span>
                )}
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="font-semibold mb-2">Console Logs:</p>
                <p className="text-muted-foreground">
                  Check the browser console (F12) for detailed logs prefixed with{' '}
                  <code className="bg-muted px-1 rounded">[STUDENTS_DETAILS]</code>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

