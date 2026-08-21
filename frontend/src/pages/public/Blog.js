import { useEffect, useRef } from 'react';

const SORO_SCRIPT_SRC = 'https://app.trysoro.com/api/embed/23bbfb06-5f86-4ae5-b7b6-33670f8a2f2a';

export default function Blog() {
  const containerRef = useRef(null);

  useEffect(() => {
    document.title = "Blog | O'SIPP Delivery";

    let script = document.querySelector(`script[src="${SORO_SCRIPT_SRC}"]`);
    if (!script) {
      script = document.createElement('script');
      script.src = SORO_SCRIPT_SRC;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: 900 }}>
        <div className="section-header" style={{ textAlign: 'left', marginBottom: 24 }}>
          <div className="section-title">Blog</div>
        </div>
        <div id="soro-blog" ref={containerRef}></div>
      </div>
    </div>
  );
}
