import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MapPin, Briefcase, DollarSign, Building2, FileText, Upload } from "lucide-react";
import { Session } from "@supabase/supabase-js";

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<any>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    fetchJob();
    checkAuth();
  }, [id]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
    
    if (session) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();
      
      if (profile) {
        setUserRole(profile.role);
        if (profile.role === "candidate") {
          checkIfApplied(session.user.id);
        }
      }
    }
  };

  const checkIfApplied = async (userId: string) => {
    const { data } = await supabase
      .from("applications")
      .select("id")
      .eq("job_id", id)
      .eq("candidate_id", userId)
      .single();
    
    setHasApplied(!!data);
  };

  const fetchJob = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast.error("Job not found");
      navigate("/jobs");
      return;
    }

    setJob(data);
    setLoading(false);
  };

  const handleApply = async () => {
    if (!session) {
      toast.error("Please sign in to apply");
      navigate("/auth");
      return;
    }

    if (userRole !== "candidate") {
      toast.error("Only job seekers can apply to jobs");
      return;
    }

    if (!resumeFile) {
      toast.error("Please upload your resume");
      return;
    }

    setApplying(true);

    try {
      // Upload resume
      const fileExt = resumeFile.name.split(".").pop();
      const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(fileName, resumeFile);

      if (uploadError) throw uploadError;

      // Create application
      const { error: applicationError } = await supabase
        .from("applications")
        .insert({
          job_id: id,
          candidate_id: session.user.id,
          cover_letter: coverLetter,
          resume_url: fileName,
        });

      if (applicationError) throw applicationError;

      toast.success("Application submitted successfully!");
      setHasApplied(true);
      setCoverLetter("");
      setResumeFile(null);
    } catch (error: any) {
      toast.error(error.message || "Error submitting application");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 mb-8">
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{job.title}</h1>
                  <div className="flex items-center gap-2 text-xl text-muted-foreground">
                    <Building2 className="h-5 w-5" />
                    {job.company}
                  </div>
                </div>
                {job.is_featured && (
                  <Badge className="bg-gradient-to-r from-accent to-primary">Featured</Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {job.location}
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  {job.job_type}
                </div>
                {job.salary_range && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    {job.salary_range}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-3">Job Description</h2>
                <p className="text-muted-foreground whitespace-pre-wrap">{job.description}</p>
              </div>

              {job.requirements && (
                <div>
                  <h2 className="text-2xl font-semibold mb-3">Requirements</h2>
                  <p className="text-muted-foreground whitespace-pre-wrap">{job.requirements}</p>
                </div>
              )}

              {job.benefits && (
                <div>
                  <h2 className="text-2xl font-semibold mb-3">Benefits</h2>
                  <p className="text-muted-foreground whitespace-pre-wrap">{job.benefits}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Application Form */}
          {userRole === "candidate" && !hasApplied && (
            <Card className="p-8">
              <h2 className="text-2xl font-semibold mb-6">Apply for this Position</h2>
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="cover-letter">Cover Letter (Optional)</Label>
                  <Textarea
                    id="cover-letter"
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Tell us why you're a great fit for this role..."
                    rows={6}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="resume">Resume *</Label>
                  <div className="mt-2">
                    <label htmlFor="resume" className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-8 cursor-pointer hover:bg-secondary transition-colors">
                      <Upload className="h-6 w-6" />
                      <span>{resumeFile ? resumeFile.name : "Click to upload resume (PDF, DOC, DOCX)"}</span>
                      <input
                        id="resume"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <Button onClick={handleApply} disabled={applying || !resumeFile} size="lg" className="w-full">
                  {applying ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </Card>
          )}

          {hasApplied && (
            <Card className="p-8 text-center bg-success/10 border-success">
              <FileText className="h-16 w-16 mx-auto mb-4 text-success" />
              <h3 className="text-2xl font-semibold mb-2">Application Submitted!</h3>
              <p className="text-muted-foreground">
                Your application has been successfully submitted. The employer will review it and contact you if you're selected.
              </p>
            </Card>
          )}

          {!session && (
            <Card className="p-8 text-center">
              <h3 className="text-2xl font-semibold mb-4">Ready to Apply?</h3>
              <p className="text-muted-foreground mb-6">
                Sign in or create an account to apply for this position
              </p>
              <Button onClick={() => navigate("/auth")} size="lg">
                Sign In to Apply
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
