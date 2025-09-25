import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
 
// process.cwd()でrootのディレクトリが取得でき、そこを起点としてpath.joinでファイルへのパスを作る。 
const releasesDirectory = path.join(process.cwd(), "content/releases");

// すべてのリリースデータを取得
export function getAllReleases() {
  //  同期的にcontent/releases以下のファイル名を配列で取得
  const fileNames = fs.readdirSync(releasesDirectory);

  const allReleasesData = fileNames.map((fileName) => {
    const fullPath = path.join(releasesDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const matterResult = matter(fileContents);

    // ファイル名からバージョン番号部分を取得（v1.0.0.md → v1.0.0）
    const version = fileName.replace(/\.md$/, "");
  
      // バージョン情報にフロントマターのデータを組み合わせる
      return {
        version,
        ...(matterResult.data as {
          date: string;
          title: string;
          type: "major" | "minor" | "patch";
        }),
      };
  });
 
  // 日付で降順ソート（最新のリリースを先頭に）
  return allReleasesData.sort((a, b) => a.date < b.date ? 1 : -1);

}
 
// 全リリースのバージョン一覧を取得（動的ルーティング用）
export function getAllReleaseVersions() {
  const fileNames = fs.readdirSync(releasesDirectory);
  return fileNames.map((fileName) => {
    return {
      version: fileName.replace(/\.md$/, ""),
    };
  });
}
 
// 特定バージョンのリリースデータを取得
export async function getReleaseData(version: string) {
  const fullPath = path.join(releasesDirectory, `${version}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
 
  // フロントマターでパース
  const matterResult = matter(fileContents);
 
  // Markdownをパースしてhtml文字列に変換
  const processedContent = await remark()
    .use(html, { sanitize: false })
    .process(matterResult.content);

  const contentHtml = processedContent.toString();
 
  return {
    version,
    contentHtml,
    ...(matterResult.data as {
      date: string;
      title: string;
      type: "major" | "minor" | "patch";
    }),
  };
}