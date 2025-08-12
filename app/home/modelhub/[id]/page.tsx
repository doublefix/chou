"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarIcon, GitBranchIcon, ArrowLeftIcon } from "lucide-react";
import { useEffect, useState } from "react";

// 这里应该根据你的实际数据源来获取数据
// 例如从API或者context中获取
type Repo = {
  id: number;
  name: string;
  full_name: string;
  description: string;
  owner: {
    id: number;
    login: string;
    avatar_url: string;
  };
  stars_count: number;
  forks_count: number;
  created_at: string;
  updated_at: string;
  archived: boolean;
  private: boolean;
  default_branch: string;
};

const useRepoDetail = (id: string) => {
  const [repo, setRepo] = useState<Repo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 这里应该是你的数据获取逻辑
    // 暂时使用示例数据
    const fetchRepo = async () => {
      try {
        // const response = await fetch(`/api/repos/${id}`);
        // const data = await response.json();

        // 示例数据 - 你需要根据实际情况替换
        const mockData = {
          id: parseInt(id),
          name: "example-repo",
          full_name: "user/example-repo",
          description: "This is an example repository description",
          owner: {
            id: 1,
            login: "user",
            avatar_url: "https://github.com/user.png",
          },
          stars_count: 123,
          forks_count: 45,
          created_at: "2023-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          archived: false,
          private: false,
          default_branch: "main",
        };

        setRepo(mockData);
      } catch (error) {
        console.error("Failed to fetch repo:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRepo();
    }
  }, [id]);

  return { repo, loading };
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

export default function RepoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { repo, loading } = useRepoDetail(id);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading repository details...</p>
        </div>
      </div>
    );
  }

  if (!repo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Repository not found</h1>
          <Button onClick={() => router.back()}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 头部导航 */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="h-4 w-px bg-border"></div>
        <nav className="text-sm text-muted-foreground">
          <span>Repositories</span>
          <span className="mx-2">/</span>
          <span className="text-foreground font-medium">{repo.full_name}</span>
        </nav>
      </div>

      {/* 项目信息卡片 */}
      <div className="bg-card rounded-lg border p-6 mb-6">
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={repo.owner.avatar_url} alt={repo.owner.login} />
            <AvatarFallback>
              {repo.owner.login.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{repo.full_name}</h1>
            <p className="text-muted-foreground mb-4">
              {repo.description ||
                "No description provided for this repository."}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant={repo.private ? "secondary" : "outline"}>
                {repo.private ? "Private" : "Public"}
              </Badge>
              {repo.archived && <Badge variant="destructive">Archived</Badge>}
              <Badge variant="outline">
                <GitBranchIcon className="h-3 w-3 mr-1" />
                {repo.default_branch || "main"}
              </Badge>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <StarIcon className="h-4 w-4 mr-2" />
              Star
            </Button>
            <Button size="sm">
              <GitBranchIcon className="h-4 w-4 mr-2" />
              Clone
            </Button>
          </div>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-2">
            <StarIcon className="h-5 w-5 text-yellow-500" />
            <span className="font-medium">Stars</span>
          </div>
          <div className="text-2xl font-bold">{repo.stars_count}</div>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-2">
            <GitBranchIcon className="h-5 w-5" />
            <span className="font-medium">Forks</span>
          </div>
          <div className="text-2xl font-bold">{repo.forks_count}</div>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="font-medium mb-2">Created</div>
          <div className="text-sm text-muted-foreground">
            {formatDate(repo.created_at)}
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="font-medium mb-2">Last Updated</div>
          <div className="text-sm text-muted-foreground">
            {formatDate(repo.updated_at)}
          </div>
        </div>
      </div>

      {/* 项目详细信息 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">About</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-muted-foreground">
                  {repo.description ||
                    "No description provided for this repository."}
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Default Branch</h3>
                <Badge variant="outline">
                  <GitBranchIcon className="h-3 w-3 mr-1" />
                  {repo.default_branch || "main"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Owner</h2>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={repo.owner.avatar_url}
                  alt={repo.owner.login}
                />
                <AvatarFallback>
                  {repo.owner.login.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{repo.owner.login}</div>
                <div className="text-sm text-muted-foreground">
                  Repository Owner
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
