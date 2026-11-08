우리 프로젝트는 프론트엔드와 Supabase 백엔드가 결합된 모노레포 구조야.

데이터베이스 스키마(테이블, RLS 정책)를 수정할 일이 생기면, 반드시 supabase/migrations/ 폴더에 새로운 마이그레이션 SQL 파일을 생성해줘.

마이그레이션 파일을 추가한 후에는 반드시 supabase gen types typescript --local > src/lib/database.types.ts 명령어를 실행(또는 실행하라고 나에게 안내)해서 프론트엔드 타입을 최신화해줘.

프론트엔드에서 데이터를 패칭할 때는 자동 생성된 database.types.ts를 참조하여 타입 안정성을 유지해줘.