import { Dialog, DropdownMenu, Switch, Tabs, Tooltip } from 'radix-ui';

export default function App() {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Radix UI Playground</h1>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Tabs</h2>
        <Tabs.Root defaultValue="tab1">
          <Tabs.List
            style={{
              display: 'flex',
              gap: '0.5rem',
              borderBottom: '2px solid #eee',
              marginBottom: '1rem',
            }}
          >
            <Tabs.Trigger value="tab1" style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
              탭 1
            </Tabs.Trigger>
            <Tabs.Trigger value="tab2" style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
              탭 2
            </Tabs.Trigger>
            <Tabs.Trigger value="tab3" style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
              탭 3
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="tab1">
            <p>탭 1 컨텐츠입니다.</p>
          </Tabs.Content>
          <Tabs.Content value="tab2">
            <p>탭 2 컨텐츠입니다.</p>
          </Tabs.Content>
          <Tabs.Content value="tab3">
            <p>탭 3 컨텐츠입니다.</p>
          </Tabs.Content>
        </Tabs.Root>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Switch</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Switch.Root
            id="airplane-mode"
            style={{
              width: '42px',
              height: '25px',
              backgroundColor: '#ccc',
              borderRadius: '9999px',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <Switch.Thumb
              style={{
                display: 'block',
                width: '21px',
                height: '21px',
                backgroundColor: 'white',
                borderRadius: '9999px',
                transition: 'transform 100ms',
                transform: 'translateX(2px)',
              }}
            />
          </Switch.Root>
          <label htmlFor="airplane-mode">비행기 모드</label>
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Tooltip</h2>
        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
                마우스를 올려보세요
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                style={{
                  backgroundColor: '#333',
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
                sideOffset={5}
              >
                툴팁 내용입니다!
                <Tooltip.Arrow style={{ fill: '#333' }} />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Dropdown Menu</h2>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>메뉴 열기 ▼</button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              style={{
                backgroundColor: 'white',
                border: '1px solid #eee',
                borderRadius: '6px',
                padding: '0.25rem',
                minWidth: '150px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
              sideOffset={4}
            >
              <DropdownMenu.Item
                style={{ padding: '0.5rem 0.75rem', cursor: 'pointer', borderRadius: '4px' }}
              >
                항목 1
              </DropdownMenu.Item>
              <DropdownMenu.Item
                style={{ padding: '0.5rem 0.75rem', cursor: 'pointer', borderRadius: '4px' }}
              >
                항목 2
              </DropdownMenu.Item>
              <DropdownMenu.Separator
                style={{ height: '1px', backgroundColor: '#eee', margin: '0.25rem 0' }}
              />
              <DropdownMenu.Item
                style={{
                  padding: '0.5rem 0.75rem',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  color: 'red',
                }}
              >
                삭제
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Dialog</h2>
        <Dialog.Root>
          <Dialog.Trigger asChild>
            <button style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>다이얼로그 열기</button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay
              style={{
                backgroundColor: 'rgba(0,0,0,0.5)',
                position: 'fixed',
                inset: 0,
              }}
            />
            <Dialog.Content
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '2rem',
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '400px',
                maxWidth: '90vw',
                boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
              }}
            >
              <Dialog.Title style={{ marginBottom: '0.5rem' }}>다이얼로그 제목</Dialog.Title>
              <Dialog.Description style={{ color: '#666', marginBottom: '1rem' }}>
                여기에 내용을 입력하세요.
              </Dialog.Description>
              <Dialog.Close asChild>
                <button style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>닫기</button>
              </Dialog.Close>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </section>
    </div>
  );
}
