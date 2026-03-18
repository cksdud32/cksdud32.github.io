document.addEventListener('DOMContentLoaded', () => {
    const yearButtons = document.querySelectorAll('.love-y li div');
    const monthContainer = document.querySelector('.live-m');
    const modal = document.getElementById('love-modal');

    // 1. 연도 버튼 클릭 이벤트
    yearButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // id가 "y2026" 형태이므로 'y'를 제거하여 "2026" 추출
            const year = btn.id.replace('y', '');
            fetchYearData(year);
        });
    });

    // 2. JSON 데이터 가져오기 (json/ 폴더 내 파일 호출)
    async function fetchYearData(year) {
        try {
            const response = await fetch(`json/love${year}.json`);
            if (!response.ok) throw new Error("파일을 찾을 수 없습니다.");

            const data = await response.json();
            renderArchive(data);
        } catch (err) {
            console.error("데이터 로딩 실패:", err);
            alert(`${year}년 기록(json/love${year}.json)을 불러올 수 없습니다.`);
        }
    }

    // 3. 화면 그리기 및 드래그 스크롤 구현
    function renderArchive(data) {
        monthContainer.innerHTML = '';
        monthContainer.style.display = 'block';

        data.forEach(mGroup => {
            const section = document.createElement('div');
            section.className = 'month-section';

            section.innerHTML = `
                <h2 class="month-title">${mGroup.month}월</h2>
                <div class="day-wrapper"></div>
            `;

            const wrapper = section.querySelector('.day-wrapper');

            // --- 드래그 스크롤 변수 ---
            let isDown = false;
            let startX;
            let scrollLeft;

            // 래퍼 자체에 드래그 이벤트 등록
            wrapper.addEventListener('mousedown', (e) => {
                isDown = true;
                wrapper.classList.add('active');
                startX = e.pageX - wrapper.offsetLeft;
                scrollLeft = wrapper.scrollLeft;
            });
            wrapper.addEventListener('mouseleave', () => { isDown = false; });
            wrapper.addEventListener('mouseup', () => { isDown = false; });
            wrapper.addEventListener('mousemove', (e) => {
                if (!isDown) return;
                e.preventDefault();
                const x = e.pageX - wrapper.offsetLeft;
                const walk = (x - startX) * 2; // 스크롤 속도
                wrapper.scrollLeft = scrollLeft - walk;
            });

            // 카드 생성
            mGroup.records.forEach(rec => {
                const card = document.createElement('div');
                card.className = 'day-card';

                card.innerHTML = `
                    <div class="photo-frame">
                             <img src="${rec.images[0]}" onerror="this.src='https://via.placeholder.com/250x350?text=No+Image'">
                              <div class="photo-text">
                                 <span class="card-date">${rec.date}</span>
                                 <span class="card-date-title">${rec.title}</span>
                                 <p>${rec.summary}</p>
                             </div>
                    </div>
                `;

                // --- 클릭 vs 드래그 구분 로직 ---
                let dragStartPos = { x: 0, y: 0 };

                card.addEventListener('mousedown', (e) => {
                    dragStartPos = { x: e.screenX, y: e.screenY };
                });

                card.addEventListener('mouseup', (e) => {
                    const dragEndPos = { x: e.screenX, y: e.screenY };
                    const distance = Math.sqrt(
                        Math.pow(dragEndPos.x - dragStartPos.x, 2) +
                        Math.pow(dragEndPos.y - dragStartPos.y, 2)
                    );

                    // 마우스를 누르고 움직인 거리가 5px 미만일 때만 클릭(팝업)으로 인정
                    if (distance < 5) {
                        openModal(rec);
                    }
                });

                wrapper.appendChild(card);
            });

            monthContainer.appendChild(section);
        });

        // 데이터 로드 후 상단으로 부드럽게 이동
        window.scrollTo({ top: monthContainer.offsetTop - 50, behavior: 'smooth' });
    }

    // 4. 모달 열기
    function openModal(rec) {
        document.getElementById('modal-date').innerText = `${rec.date}
        ${rec.title}`;
        document.getElementById('modal-text').innerText = rec.content;

        const photoRight = document.getElementById('modal-photos');
        photoRight.innerHTML = '';

        rec.images.forEach(imgSrc => {
            const img = document.createElement('img');
            img.src = imgSrc;
            photoRight.appendChild(img);
        });

        modal.style.display = 'block';
    }

    // 5. 모달 닫기
    const closeBtn = document.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.onclick = () => modal.style.display = 'none';
    }

    window.onclick = (e) => {
        if (e.target == modal) modal.style.display = 'none';
    };
});