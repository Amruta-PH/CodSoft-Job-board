import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/Navbar";
import { JobCard } from "@/components/JobCard";
import { supabase } from "@/integrations/supabase/client";
import { Search, Briefcase, Users, TrendingUp } from "lucide-react";

export default function Index() {
  const [featuredJobs, setFeaturedJobs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchFeaturedJobs();
  }, []);

  const fetchFeaturedJobs = async () => {
    const { data } = await supabase
      .from("jobs")
      .select("*")
      .eq("is_featured", true)
      .eq("status", "active")
      .limit(6)
      .order("created_at", { ascending: false });

    if (data) {
      setFeaturedJobs(data);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      window.location.href = `/jobs?search=${encodeURIComponent(searchTerm)}`;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-secondary to-background py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Find Your Dream Job Today
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Connect with top employers and discover opportunities that match your skills and passion
          </p>

          <div className="flex gap-2 max-w-2xl mx-auto">
            <Input
              type="text"
              placeholder="Search for jobs, companies, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="h-12"
            />
            <Button onClick={handleSearch} size="lg" className="gap-2">
              <Search className="h-5 w-5" />
              Search
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <Briefcase className="h-12 w-12 mx-auto text-primary" />
              <h3 className="text-3xl font-bold">1000+</h3>
              <p className="text-muted-foreground">Active Jobs</p>
            </div>
            <div className="space-y-2">
              <Users className="h-12 w-12 mx-auto text-primary" />
              <h3 className="text-3xl font-bold">500+</h3>
              <p className="text-muted-foreground">Companies</p>
            </div>
            <div className="space-y-2">
              <TrendingUp className="h-12 w-12 mx-auto text-primary" />
              <h3 className="text-3xl font-bold">10,000+</h3>
              <p className="text-muted-foreground">Successful Hires</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      {featuredJobs.length > 0 && (
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">Featured Jobs</h2>
                <p className="text-muted-foreground">Top opportunities from leading companies</p>
              </div>
              <Link to="/jobs">
                <Button variant="outline">View All Jobs</Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  id={job.id}
                  title={job.title}
                  company={job.company}
                  location={job.location}
                  jobType={job.job_type}
                  salaryRange={job.salary_range}
                  isFeatured={job.is_featured}
                  createdAt={job.created_at}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary to-accent text-white">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of job seekers and employers finding success on our platform
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="text-primary">
                Sign Up as Job Seeker
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="bg-white text-primary hover:bg-white/90">
                Post a Job
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
