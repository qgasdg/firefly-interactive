# Firefly 🌟

마우스를 움직이면 반딧불이들이 흩어지는 인터랙티브 캔버스입니다.
프레임워크 없이 순수 JavaScript와 Canvas 2D API만으로 만들었습니다.

**🔗 데모: https://firefly-interactive.vercel.app/**

## 실행 방법

빌드 과정이 없어요. `index.html`을 브라우저로 열면 바로 동작합니다.

로컬 서버로 띄우고 싶다면:

```bash
npx serve .
# 또는
python3 -m http.server
```

## 조작

| 컨트롤 | 설명 |
| --- | --- |
| **Particles** | 반딧불이 개수 (10 ~ 120) |
| **Repulsion Radius** | 마우스가 반딧불이를 밀어내는 범위 (px) |
| **Speed** | 이동 속도 |
| **Size** | 반딧불이 크기 |
| **Color Preset** | 빛 색상 5가지 중 선택 |

## 동작 원리

- **방향 기반 떠돌기** — 각 반딧불이는 자기 진행 방향(각도)을 조금씩 무작위로 틀면서 움직여요. 원래 자리로 돌아가려 하지 않아서 자연스럽게 떠다닙니다.
- **마우스 반발** — 커서가 가까이 오면 반대 방향으로 방향을 바꾸고, 가까울수록 순간 속도가 커져요. 이후 속도는 서서히 원래대로 줄어들지만, 바뀐 방향은 그대로 유지됩니다.
- **빛 번짐 효과** — 매 프레임마다 반딧불이 하나하나에 방사형 그라데이션(중심에서 바깥으로 옅어지는 색)을 그려 은은한 빛을 표현해요.
- **깜빡임** — 투명도가 가끔씩 새 목표값으로 천천히 바뀌어 반짝이는 느낌을 줍니다.
- **화면 가장자리 순환** — 화면 밖으로 나가면 반대편에서 다시 나타나요.
- **탭 전환 대응** — 탭이 보일 땐 `requestAnimationFrame`, 숨겨지면 `setInterval`로 애니메이션을 이어갑니다.

## 파일 구조

```
.
├── index.html   # 페이지 구조와 컨트롤 UI
├── style.css    # 스타일
├── firefly.js   # FireflyEngine — 입자 물리/렌더링 엔진
└── main.js      # 엔진 생성 및 컨트롤 연결
```

## FireflyEngine 사용법

다른 페이지에서도 엔진만 가져다 쓸 수 있어요.

```html
<canvas id="canvas"></canvas>
<script src="firefly.js"></script>
<script>
  const engine = new FireflyEngine(document.getElementById('canvas'), {
    count: 55,
    color: [255, 210, 100],
  });
  engine.start();
  // engine.stop(); // 멈추고 이벤트 해제
</script>
```

### 옵션

| 옵션 | 기본값 | 설명 |
| --- | --- | --- |
| `count` | `55` | 반딧불이 개수 |
| `color` | `[255, 210, 100]` | RGB 색상 |
| `minOpacity` / `maxOpacity` | `0.2` / `0.45` | 투명도 범위 |
| `minSize` / `maxSize` | `2` / `5` | 크기 범위 (px) |
| `baseSpeed` | `0.35` | 평소 이동 속도 (px/프레임) |
| `burstSpeed` | `6` | 마우스에 밀릴 때 최대 순간 속도 |
| `burstDecay` | `0.92` | 순간 속도가 줄어드는 비율 (1에 가까울수록 천천히 감소) |
| `wanderStrength` | `0.04` | 방향이 흔들리는 정도 |
| `repulsionRadius` | `110` | 마우스 반발 범위 (px) |

`engine.options`를 직접 바꾸면 실행 중에도 바로 반영돼요. 단, `count`나 크기처럼 반딧불이를 새로 만들어야 하는 값은 `stop()` → `start()`로 다시 시작해야 적용됩니다.
