import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";

export default function NotFound() {
  return <section className="not-found" aria-labelledby="not-found-title">
    <div className="not-found-art" aria-hidden="true">
      <div className="not-found-orbit" />
      <div className="not-found-document"><FileQuestion strokeWidth={1.3} /></div>
      <span className="not-found-spark not-found-spark-one" />
      <span className="not-found-spark not-found-spark-two" />
    </div>
    <p className="not-found-code">404</p>
    <h1 id="not-found-title">페이지를 찾을 수 없습니다</h1>
    <p className="not-found-description">요청하신 페이지가 없거나 주소가 변경되었어요.<br />주소를 확인하거나 대시보드로 돌아가 주세요.</p>
    <Link className="button primary" href="/"><ArrowLeft size={18} aria-hidden="true" />대시보드로 이동</Link>
  </section>;
}
