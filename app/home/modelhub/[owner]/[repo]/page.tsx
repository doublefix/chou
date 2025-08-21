"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useRepoContents } from "@/hooks/useRepoContent";
import { useRepoDetailInfo } from "@/hooks/useRepoDetailInfo";
import { useFileContent } from "@/hooks/useRepoFileContent";
import { useLastCommit } from "@/hooks/useLastCommit";
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
  ChevronRightIcon,
  CodeIcon,
} from "lucide-react";

import { useState } from "react";
import React from "react";

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

// 文件类型图标映射
const fileIcons: Record<string, React.ElementType> = {
  js: CodeIcon,
  ts: CodeIcon,
  jsx: CodeIcon,
  tsx: CodeIcon,
  py: CodeIcon,
  java: CodeIcon,
  c: CodeIcon,
  cpp: CodeIcon,
  html: CodeIcon,
  css: CodeIcon,
  json: CodeIcon,
  md: BookIcon,
  txt: FileIcon,
};

const getFileIcon = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase() || "";
  return fileIcons[extension] || FileIcon;
};

// 语法高亮组件
const SyntaxHighlighter = ({
  content,
  language,
}: {
  content: string;
  language?: string;
}) => {
  return (
    <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96">
      <code
        className={`language-${
          language || "text"
        } text-sm leading-relaxed font-mono block`}
      >
        {content}
      </code>
    </pre>
  );
};

// 文件内容查看器组件
const FileContentViewer = ({
  content,
  isLoading,
  error,
  fileName,
}: {
  content: any;
  isLoading: boolean;
  error: any;
  fileName: string;
}) => {
  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-center text-destructive py-8">
          Failed to load file: {error.message}
        </div>
      </div>
    );
  }

  if (content) {
    const fileContent =
      content.encoding === "base64" && content.content
        ? decodeBase64(content.content)
        : content.content || "No content available";

    const extension = fileName.split(".").pop() || "";

    return (
      <div className="p-4">
        <SyntaxHighlighter content={fileContent} language={extension} />
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="text-center text-muted-foreground py-8">
        No file content available
      </div>
    </div>
  );
};

export default function RepoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const owner = params.owner;
  const repoName = params.repo;

  // 添加状态来跟踪当前路径
  const [currentPath, setCurrentPath] = useState("");
  // 添加状态来跟踪当前选中的文件
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const {
    repoDetail,
    error: detailError,
    isLoading: detailLoading,
  } = useRepoDetailInfo(
    typeof owner === "string" ? owner : "",
    typeof repoName === "string" ? repoName : ""
  );

  // 使用当前路径获取内容
  const {
    contents,
    isLoading: contentsLoading,
    error: contentsError,
  } = useRepoContents(
    typeof owner === "string" ? owner : "",
    typeof repoName === "string" ? repoName : "",
    currentPath,
    { ref: repoDetail?.default_branch }
  );

  const { lastCommit, error, isLoading, mutate } = useLastCommit(
    "admin",
    "opus-mt-en-fr-test-upload"
  );

  const hasReadme = contents?.some(
    (item) => item.name.toLowerCase() === "readme.md"
  );

  // 获取README文件内容
  const {
    fileContent: readmeContent,
    isLoading: readmeLoading,
    error: readmeError,
  } = useFileContent(
    typeof owner === "string" ? owner : "",
    typeof repoName === "string" ? repoName : "",
    "README.md",
    {
      ref: repoDetail?.default_branch,
    }
  );

  // 获取选中的文件内容
  const {
    fileContent: selectedFileContent,
    isLoading: selectedFileLoading,
    error: selectedFileError,
  } = useFileContent(
    typeof owner === "string" ? owner : "",
    typeof repoName === "string" ? repoName : "",
    selectedFile || "",
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

  // 处理文件夹点击
  const handleFolderClick = (folderName: string) => {
    // 更新当前路径
    const newPath = currentPath ? `${currentPath}/${folderName}` : folderName;
    setCurrentPath(newPath);
    // 清除选中的文件
    setSelectedFile(null);
  };

  // 处理文件点击
  const handleFileClick = (fileName: string) => {
    // 构建完整文件路径
    const fullPath = currentPath ? `${currentPath}/${fileName}` : fileName;
    setSelectedFile(fullPath);
  };

  // 处理返回上一级
  const handleNavigateBack = () => {
    if (selectedFile) {
      // 如果正在查看文件，返回文件列表
      setSelectedFile(null);
    } else if (currentPath) {
      // 找到最后一个斜杠的位置
      const lastSlashIndex = currentPath.lastIndexOf("/");
      if (lastSlashIndex === -1) {
        // 如果在根目录下的文件夹，返回根目录
        setCurrentPath("");
      } else {
        // 返回上一级目录
        setCurrentPath(currentPath.substring(0, lastSlashIndex));
      }
    }
  };

  // 生成面包屑导航
  const generateBreadcrumbs = () => {
    const breadcrumbs = [];

    // 添加仓库根目录
    breadcrumbs.push({
      name: repoDetail?.name || "",
      path: "",
      isRoot: true,
    });

    // 添加当前路径的各个部分
    if (currentPath) {
      const parts = currentPath.split("/");
      for (let i = 0; i < parts.length; i++) {
        const path = parts.slice(0, i + 1).join("/");
        breadcrumbs.push({
          name: parts[i],
          path: path,
        });
      }
    }

    return breadcrumbs;
  };

  // 获取当前显示的文件名（用于面包屑导航）
  const getCurrentFileName = () => {
    if (!selectedFile) return null;
    return selectedFile.split("/").pop() || "";
  };

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

                {/* 面包屑导航 */}
                <Breadcrumb>
                  <BreadcrumbList className="text-sm text-muted-foreground">
                    <BreadcrumbItem>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-1"
                        onClick={handleNavigateBack}
                        disabled={!currentPath && !selectedFile}
                      >
                        <ArrowLeftIcon className="h-3 w-3 mr-1" />
                        Back
                      </Button>
                    </BreadcrumbItem>

                    {generateBreadcrumbs().map((breadcrumb, index, array) => (
                      <React.Fragment key={index}>
                        <BreadcrumbSeparator>
                          <ChevronRightIcon className="h-3 w-3 text-muted-foreground/70" />
                        </BreadcrumbSeparator>
                        <BreadcrumbItem>
                          <BreadcrumbLink asChild>
                            <button
                              className="h-6 px-1"
                              onClick={() => {
                                if (breadcrumb.isRoot) {
                                  setCurrentPath("");
                                  setSelectedFile(null);
                                } else {
                                  setCurrentPath(breadcrumb.path);
                                  setSelectedFile(null);
                                }
                              }}
                            >
                              {breadcrumb.name}
                            </button>
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                      </React.Fragment>
                    ))}

                    {/* 显示当前选中的文件名 */}
                    {selectedFile && (
                      <>
                        <BreadcrumbSeparator>
                          <ChevronRightIcon className="h-3 w-3 text-muted-foreground/70" />
                        </BreadcrumbSeparator>
                        <BreadcrumbItem>
                          <span className="h-6 px-1 text-foreground font-medium">
                            {getCurrentFileName()}
                          </span>
                        </BreadcrumbItem>
                      </>
                    )}
                  </BreadcrumbList>
                </Breadcrumb>
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
                <div className="flex items-center w-full gap-3">
                  {/* 行首：头像 */}
                  <Avatar className="h-6 w-6 flex-shrink-0">
                    <AvatarFallback className="text-[12px]">
                      {lastCommit?.committer?.username
                        ?.charAt(0)
                        .toUpperCase() ||
                        repoDetail.owner.login.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* 用户名 */}
                  <p className="text-sm font-medium truncate max-w-[120px]">
                    {lastCommit?.committer?.username || repoDetail.owner.login}
                  </p>

                  {/* 提交信息 + commit号 */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground truncate">
                      {lastCommit?.message ||
                        `Latest commit on ${repoDetail.default_branch}`}
                    </p>
                    <code className="bg-background px-2 py-0.5 rounded text-xs text-muted-foreground whitespace-nowrap">
                      {lastCommit?.id?.substring(0, 7) ||
                        (contents && contents.length > 0
                          ? contents[0].last_commit_sha?.substring(0, 7) ||
                            "N/A"
                          : "N/A")}
                    </code>
                  </div>

                  {/* 行尾：时间 */}
                  {lastCommit?.timestamp && (
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(lastCommit.timestamp)}
                    </div>
                  )}
                </div>
              </div>
              {selectedFile ? (
                <FileContentViewer
                  content={selectedFileContent}
                  isLoading={selectedFileLoading}
                  error={selectedFileError}
                  fileName={selectedFile}
                />
              ) : contentsError ? (
                <div className="p-4 text-center text-destructive">
                  Failed to load repository contents: {contentsError.message}
                </div>
              ) : !contents || contents.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No files found in this {currentPath ? "folder" : "repository"}
                </div>
              ) : (
                <div className="divide-y">
                  {/* 首先显示文件夹 */}
                  {contents
                    .filter((item) => item.type === "dir")
                    .map((folder) => (
                      <div
                        key={folder.name}
                        className="grid grid-cols-[1fr_100px_1fr_150px] items-center px-4 py-3 hover:bg-muted/30 transition-colors gap-6 cursor-pointer"
                        onClick={() => handleFolderClick(folder.name)}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FolderIcon
                            className="h-4 w-4 text-blue-400"
                            fill="currentColor"
                          />
                          <Button
                            variant="ghost"
                            className="p-0 h-auto font-medium text-black hover:text-blue-800 hover:underline text-left truncate"
                          >
                            {folder.name}
                          </Button>
                        </div>

                        <div className="flex items-center justify-center space-x-2">
                          <div className="text-sm text-muted-foreground/60 text-right w-[60px]">
                            {/* 文件夹不显示大小 */}
                          </div>
                        </div>

                        <div className="text-sm text-muted-foreground/60 truncate max-w-md">
                          Folder
                        </div>

                        <div className="text-sm text-muted-foreground/60 whitespace-nowrap text-right">
                          {folder.last_committer_date
                            ? formatDate(folder.last_committer_date)
                            : "N/A"}
                        </div>
                      </div>
                    ))}
                  {/* 然后显示文件 - 使用与文件夹相同的样式 */}
                  {contents
                    .filter((item) => item.type === "file")
                    .map((file) => (
                      <div
                        key={file.name}
                        className="grid grid-cols-[1fr_100px_1fr_150px] items-center px-4 py-3 hover:bg-muted/30 transition-colors gap-6 cursor-pointer"
                        onClick={() => handleFileClick(file.name)}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <Button
                            variant="ghost"
                            className="p-0 h-auto font-medium text-black hover:text-blue-800 hover:underline text-left truncate"
                          >
                            {file.name}
                          </Button>
                        </div>

                        <div className="flex items-center justify-center space-x-2">
                          <div className="text-sm text-muted-foreground/60 text-right w-[60px]">
                            {file.size > 0 ? formatSize(file.size) : ""}
                          </div>

                          {file.download_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground/60 hover:text-foreground flex items-center justify-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open("", "_blank");
                              }}
                            >
                              <DownloadIcon className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="text-sm text-muted-foreground/60 truncate max-w-md">
                          Latest update
                        </div>

                        <div className="text-sm text-muted-foreground/60 whitespace-nowrap text-right">
                          {file.last_committer_date
                            ? formatDate(file.last_committer_date)
                            : "N/A"}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {hasReadme && currentPath === "" && !selectedFile && (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted/50 px-4 py-3 border-b">
                  <div className="flex items-center gap-2">
                    <BookOpenIcon className="h-4 w-4" />
                    <span className="font-medium">README.md</span>
                  </div>
                </div>
                <div className="p-6">
                  {readmeLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : readmeError ? (
                    <div className="text-center text-destructive py-8">
                      Failed to load README: {readmeError.message}
                    </div>
                  ) : readmeContent ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                        {readmeContent.encoding === "base64" &&
                        readmeContent.content
                          ? decodeBase64(readmeContent.content)
                          : readmeContent.content || "No content available"}
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
