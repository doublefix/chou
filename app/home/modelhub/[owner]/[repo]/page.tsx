"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRepoContents } from "@/hooks/useRepoContent";
import { useRepoDetailInfo } from "@/hooks/useRepoDetailInfo";
import { useFileContent } from "@/hooks/useRepoFileContent";
import {
  StarIcon,
  GitBranchIcon,
  ArrowLeftIcon,
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
import { useState } from "react";

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

const decodeBase64 = (base64: string) => {
  try {
    return atob(base64);
  } catch (error) {
    console.error("Failed to decode base64 content:", error);
    return "Unable to decode file content";
  }
};

export default function RepoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const owner = params.owner;
  const repoName = params.repo;

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
    isLoading: contentsLoading,
    error: contentsError,
  } = useRepoContents(
    typeof owner === "string" ? owner : "",
    typeof repoName === "string" ? repoName : "",
    "",
    { ref: repoDetail?.default_branch }
  );

  const hasReadme = contents?.some(
    (item) => item.name.toLowerCase() === "readme.md"
  );

  const {
    fileContent,
    isLoading: fileLoading,
    error: fileError,
  } = useFileContent(
    typeof owner === "string" ? owner : "",
    typeof repoName === "string" ? repoName : "",
    "README.md",
    {
      ref: repoDetail?.default_branch,
    }
  );

  const [activeTab, setActiveTab] = useState("account");
  const tabs = [
    { value: "account", label: "README", icon: BookIcon },
    { value: "password", label: "Files and versions", icon: FolderIcon },
    { value: "test", label: "Test", icon: FlaskConicalIcon },
  ];

  if (detailLoading || contentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading repository details...</p>
        </div>
      </div>
    );
  }

  if (detailError || !repoDetail) {
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

          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-2xl font-bold">
                    <span className="text-muted-foreground">
                      {repoDetail.owner.login}
                    </span>
                    <span className="mx-2">/</span>
                    <span>{repoDetail.name}</span>
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <StarIcon className="h-4 w-4 mr-1" />
                  Star
                  <Badge variant="secondary" className="ml-2">
                    {repoDetail.stars_count}
                  </Badge>
                </Button>
                <Button variant="outline" size="sm">
                  <GitForkIcon className="h-4 w-4 mr-1" />
                  Fork
                  <Badge variant="secondary" className="ml-2">
                    {repoDetail.forks_count}
                  </Badge>
                </Button>
              </div>
            </div>

            <p className="text-muted-foreground max-w-3xl">
              {repoDetail.description || "No description provided"}
            </p>

            {repoDetail.topics && repoDetail.topics.length > 0 && (
              <div className="flex flex-wrap items-center gap-3">
                {repoDetail.topics.map((topic) => (
                  <Badge
                    key={topic}
                    variant="secondary"
                    className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                  >
                    {topic}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="container px-4 sm:px-6 lg:px-10">
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

      <div className="container mx-auto px-4 sm:px-6 lg:px-10 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="gap-1">
                  <GitBranchIcon className="h-4 w-4" />
                  {repoDetail.default_branch}
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

            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted/50 px-4 py-3 border-b">
                <div className="flex items-center justify-between w-full gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="h-4 w-4 flex-shrink-0">
                      <AvatarFallback>
                        {repoDetail.owner.login.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p className="text-sm font-medium truncate">
                        Latest commit on {repoDetail.default_branch}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      <span>{repoDetail.owner.login}</span>
                      <span className="mx-1">•</span>
                      <span>updated {formatDate(repoDetail.updated_at)}</span>
                    </div>

                    <code className="bg-background px-2 py-1 rounded text-xs text-muted-foreground whitespace-nowrap">
                      {contents && contents.length > 0
                        ? contents[0].last_commit_sha.substring(0, 7)
                        : "N/A"}
                    </code>
                  </div>
                </div>
              </div>

              {contentsError ? (
                <div className="p-4 text-center text-destructive">
                  Failed to load repository contents: {contentsError.message}
                </div>
              ) : !contents || contents.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No files found in this repository
                </div>
              ) : (
                <div className="divide-y">
                  {contents.map((file) => (
                    <div
                      key={file.name}
                      className="grid grid-cols-[1fr_100px_1fr_150px] items-center px-4 py-3 hover:bg-muted/30 transition-colors gap-6"
                    >
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
                        <div className="text-sm text-muted-foreground/60 text-right w-[60px]">
                          {file.type === "file" && file.size > 0
                            ? formatSize(file.size)
                            : ""}
                        </div>

                        {file.type === "file" && file.download_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground/60 hover:text-foreground flex items-center justify-center"
                            onClick={() =>
                              file.download_url &&
                              window.open(file.download_url, "_blank")
                            }
                          >
                            <DownloadIcon className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="text-sm text-muted-foreground/60 truncate max-w-md">
                        Latest update
                      </div>

                      <div className="text-sm text-muted-foreground/60 whitespace-nowrap text-right">
                        {formatDate(file.last_committer_date)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {hasReadme && (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted/50 px-4 py-3 border-b">
                  <div className="flex items-center gap-2">
                    <BookOpenIcon className="h-4 w-4" />
                    <span className="font-medium">README.md</span>
                  </div>
                </div>
                <div className="p-6">
                  {fileLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : fileError ? (
                    <div className="text-center text-destructive py-8">
                      Failed to load README: {fileError.message}
                    </div>
                  ) : fileContent ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                        {fileContent.encoding === "base64" &&
                        fileContent.content
                          ? decodeBase64(fileContent.content)
                          : fileContent.content || "No content available"}
                      </pre>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No README content available
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
