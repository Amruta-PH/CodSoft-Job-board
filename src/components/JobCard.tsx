import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, MapPin, DollarSign, Clock } from "lucide-react";
import { Link } from "react-router-dom";

interface JobCardProps {
  id: string;
  title: string;
  company: string;
  location: string;
  jobType: string;
  salaryRange?: string;
  isFeatured?: boolean;
  createdAt: string;
}

export const JobCard = ({
  id,
  title,
  company,
  location,
  jobType,
  salaryRange,
  isFeatured,
  createdAt,
}: JobCardProps) => {
  const formatDate = (date: string) => {
    const now = new Date();
    const posted = new Date(date);
    const diffInDays = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  return (
    <Link to={`/jobs/${id}`}>
      <Card className="p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer relative overflow-hidden">
        {isFeatured && (
          <div className="absolute top-0 right-0 bg-gradient-to-r from-accent to-primary text-white px-4 py-1 text-xs font-semibold">
            Featured
          </div>
        )}
        
        <div className="space-y-3">
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-1 hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-muted-foreground font-medium">{company}</p>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {location}
            </div>
            <div className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              {jobType}
            </div>
            {salaryRange && (
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                {salaryRange}
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatDate(createdAt)}
            </div>
          </div>

          <div>
            <Badge variant="secondary">{jobType}</Badge>
          </div>
        </div>
      </Card>
    </Link>
  );
};
