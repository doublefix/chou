"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRepoContents } from "@/hooks/useRepoContent";
import { useRepoDetailInfo } from "@/hooks/useRepoDetailInfo";
import {
  StarIcon,
  GitBranchIcon,
  ArrowLeftIcon,
  EyeIcon,
  GitForkIcon,
  DownloadIcon,
  FileIcon,
  FolderIcon,
  BookOpenIcon,
  Rocket,
  Wrench,
  BookIcon,
  FlaskConicalIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

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
  watchers_count: number;
  created_at: string;
  updated_at: string;
  archived: boolean;
  private: boolean;
  default_branch: string;
  language: string;
  license: string;
  topics: string[];
  homepage: string;
  clone_url: string;
  latest_commit: {
    sha: string;
    message: string;
    author: string;
    date: string;
  };
};

type FileItem = {
  name: string;
  type: "file" | "dir";
  size?: string;
  last_commit: {
    message: string;
    date: string;
  };
};

const mockFiles: FileItem[] = [
  {
    name: ".github",
    type: "dir",
    last_commit: {
      message: "Add GitHub workflows",
      date: "2024-01-15",
    },
  },
  {
    name: "src",
    type: "dir",
    last_commit: {
      message: "Refactor source code structure",
      date: "2024-01-20",
    },
  },
  {
    name: "public",
    type: "dir",
    last_commit: {
      message: "Update assets",
      date: "2024-01-18",
    },
  },
  {
    name: ".gitignore",
    type: "file",
    size: "1.2 KB",
    last_commit: {
      message: "Update gitignore",
      date: "2024-01-10",
    },
  },
  {
    name: "README.md",
    type: "file",
    size: "4.5 KB",
    last_commit: {
      message: "Update documentation",
      date: "2024-01-22",
    },
  },
  {
    name: "package.json",
    type: "file",
    size: "2.1 KB",
    last_commit: {
      message: "Update dependencies",
      date: "2024-01-21",
    },
  },
  {
    name: "tsconfig.json",
    type: "file",
    size: "856 B",
    last_commit: {
      message: "Update TypeScript config",
      date: "2024-01-19",
    },
  },
];

const mockReadme = `# Example Repository

This is an example repository showcasing a modern web application built with Next.js and TypeScript.

## 🚀 Features

- **Modern Stack**: Built with Next.js 14, TypeScript, and Tailwind CSS
- **Responsive Design**: Works perfectly on all devices
- **Performance Optimized**: Fast loading and smooth interactions
- **Developer Experience**: Hot reloading, TypeScript support, and more

## 📦 Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/user/example-repo.git

# Install dependencies
npm install

# Start the development server
npm run dev
\`\`\`

## 🛠️ Usage

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📝 Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run start\` - Start production server
- \`npm run lint\` - Run ESLint

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
`;

const useRepoDetail = (id: string) => {
  const [repo, setRepo] = useState<Repo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRepo = async () => {
      try {
        // 示例数据 - 模拟更完整的GitHub仓库信息
        const mockData: Repo = {
          id: parseInt(id),
          name: "awesome-nextjs-app",
          full_name: "johndoe/awesome-nextjs-app",
          description:
            "A modern web application built with Next.js, TypeScript, and Tailwind CSS. Features responsive design, server-side rendering, and optimized performance.",
          owner: {
            id: 1,
            login: "johndoe",
            avatar_url:
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
          },
          stars_count: 1247,
          forks_count: 89,
          watchers_count: 234,
          created_at: "2023-03-15T10:30:00Z",
          updated_at: "2024-01-22T14:25:00Z",
          archived: false,
          private: false,
          default_branch: "main",
          language: "TypeScript",
          license: "MIT",
          topics: [
            "nextjs",
            "typescript",
            "tailwindcss",
            "react",
            "web-development",
          ],
          homepage: "https://awesome-nextjs-app.vercel.app",
          clone_url: "https://github.com/johndoe/awesome-nextjs-app.git",
          latest_commit: {
            sha: "a1b2c3d",
            message: "feat: add dark mode support and improve accessibility",
            author: "johndoe",
            date: "2024-01-22T14:25:00Z",
          },
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
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return "yesterday";
  if (diffDays < 30) return `${diffDays} days ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

const formatSize = (bytes: number) => {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

export default function RepoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const owner = params.owner;
  const repoName = params.repo;

  const id = "1";
  const { repo, loading } = useRepoDetail(id);

  const [activeTab, setActiveTab] = useState("account");

  const tabs = [
    { value: "account", label: "README", icon: BookIcon },
    { value: "password", label: "Files and versions", icon: FolderIcon },
    { value: "test", label: "Test", icon: FlaskConicalIcon },
  ];

  const {
    repoDetail,
    error: detailError,
    isLoading: detailLoading,
  } = useRepoDetailInfo(
    typeof owner === "string" ? owner : "",
    typeof repoName === "string" ? repoName : ""
  );

  const {
    contents,
    isLoading,
    error: contentsError,
  } = useRepoContents(
    typeof owner === "string" ? owner : "",
    typeof repoName === "string" ? repoName : "",
    ".dvc",
    { ref: repoDetail?.default_branch }
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading repository details...</p>
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container px-4 sm:px-6 lg:px-10 py-6">
          <div className="mb-4">
            <div
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={() => router.back()}
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </div>
          </div>

          {/* Repository Header */}
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-2xl font-bold">
                    <span className="text-muted-foreground">
                      {repo.owner.login}
                    </span>
                    <span className="mx-2">/</span>
                    <span>{repo.name}</span>
                  </h1>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <StarIcon className="h-4 w-4 mr-1" />
                  Star
                  <Badge variant="secondary" className="ml-2">
                    {repo.stars_count}
                  </Badge>
                </Button>
                <Button variant="outline" size="sm">
                  <GitForkIcon className="h-4 w-4 mr-1" />
                  Fork
                  <Badge variant="secondary" className="ml-2">
                    {repo.forks_count}
                  </Badge>
                </Button>
              </div>
            </div>

            <p className="text-muted-foreground max-w-3xl">
              {repo.description}
            </p>

            {/* Topics and Links */}
            <div className="flex flex-wrap items-center gap-3">
              {repo.topics.map((topic) => (
                <Badge
                  key={topic}
                  variant="secondary"
                  className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                >
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="container px-4 sm:px-6 lg:px-10">
          {/* Tabs */}
          <div className="flex relative z-10">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <div
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`cursor-pointer flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all border-b-2
                ${
                  activeTab === tab.value
                    ? "text-black font-bold border-black"
                    : "text-black/50 border-transparent"
                }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-gray-200 mb-2" />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-10 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4">
            {/* Branch and Clone */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="gap-1">
                  <GitBranchIcon className="h-4 w-4" />
                  {repo.default_branch}
                  <Badge variant="secondary" className="ml-1">
                    default
                  </Badge>
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="gap-1">
                  <DownloadIcon className="h-4 w-4" />
                  下载
                </Button>
                <Button variant="outline" className="gap-1">
                  <Wrench className="h-4 w-4" />
                  训练
                </Button>
                <Button className="gap-1">
                  <Rocket className="h-4 w-4" />
                  部署
                </Button>
              </div>
            </div>

            {/* File Browser */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted/50 px-4 py-3 border-b">
                <div className="flex items-center justify-between w-full gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="h-4 w-4 flex-shrink-0">
                      <AvatarImage
                        src={repo.owner.avatar_url}
                        alt={repo.owner.login}
                      />
                      <AvatarFallback>
                        {repo.owner.login.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p className="text-sm font-medium truncate">
                        {repo.latest_commit.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      <span>{repo.latest_commit.author}</span>
                      <span className="mx-1">•</span>
                      <span>
                        committed {formatDate(repo.latest_commit.date)}
                      </span>
                    </div>

                    <code className="bg-background px-2 py-1 rounded text-xs text-muted-foreground whitespace-nowrap">
                      {repo.latest_commit.sha.substring(0, 7)}
                    </code>
                  </div>
                </div>
              </div>
              <div className="divide-y">
                {mockFiles.map((file) => (
                  <div
                    key={file.name}
                    className="grid grid-cols-[1fr_100px_1fr_150px] items-center px-4 py-3 hover:bg-muted/30 transition-colors gap-6"
                  >
                    {/* 列 1：文件/文件夹图标和名称 */}
                    <div className="flex items-center gap-2 min-w-0">
                      {file.type === "dir" ? (
                        <FolderIcon
                          className="h-4 w-4 text-blue-400"
                          fill="currentColor"
                        />
                      ) : (
                        <FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <Button
                        variant="ghost"
                        className="p-0 h-auto font-medium text-black hover:text-blue-800 hover:underline text-left truncate"
                      >
                        {file.name}
                      </Button>
                    </div>

                    <div className="flex items-center justify-center space-x-2">
                      {/* 固定宽度，右对齐 */}
                      <div className="text-sm text-muted-foreground/60 text-right w-[60px]">
                        {file.size || ""}
                      </div>

                      {/* 下载按钮 */}
                      {file.type === "file" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground/60 hover:text-foreground flex items-center justify-center"
                        >
                          <DownloadIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* 列 4：提交信息 */}
                    <div className="text-sm text-muted-foreground/60 truncate max-w-md">
                      {file.last_commit.message}
                    </div>

                    {/* 列 5：更新时间 */}
                    <div className="text-sm text-muted-foreground/60 whitespace-nowrap text-right">
                      {formatDate(file.last_commit.date)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* README */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted/50 px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                  <BookOpenIcon className="h-4 w-4" />
                  <span className="font-medium">README.md</span>
                </div>
              </div>
              <div className="p-6">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                    {mockReadme}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
