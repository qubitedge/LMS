import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

async function runDiagnostics() {
  console.log('🚀 Starting LMS Automated Testing & Debugging System...');
  
  const report: any = {
    timestamp: new Date().toISOString(),
    tests: {},
    typescript: { status: 'pending' },
    summary: { passed: 0, failed: 0, warnings: 0 }
  };

  // 1. Check TypeScript Issues
  console.log('🔍 Checking TypeScript integrity...');
  try {
    execSync('npx tsc --noEmit', { stdio: 'inherit' });
    report.typescript.status = 'passed';
    console.log('✅ No TypeScript issues found.');
  } catch (error: any) {
    report.typescript.status = 'failed';
    report.typescript.error = 'TypeScript compilation errors detected.';
    console.log('❌ TypeScript issues found. Check logs above.');
  }

  // 2. Run Playwright Tests
  console.log('🧪 Running Playwright test suite...');
  try {
    // Run tests and output to JSON
    execSync('npx playwright test --reporter=json', { stdio: 'pipe' });
    console.log('✅ All tests passed!');
  } catch (error: any) {
    console.log('⚠️ Some tests failed. Analyzing results...');
  }

  // 3. Analyze Results
  const resultsPath = path.resolve(process.cwd(), 'test-results.json');
  if (fs.existsSync(resultsPath)) {
    const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
    
    function processSuite(suite: any, parentTitle = '') {
      const currentTitle = parentTitle ? `${parentTitle} > ${suite.title}` : suite.title;
      
      suite.specs?.forEach((spec: any) => {
        const testName = currentTitle ? `${currentTitle} > ${spec.title}` : spec.title;
        spec.tests.forEach((test: any) => {
          const status = test.results[0]?.status || 'skipped';
          
          if (status === 'passed') {
            report.summary.passed++;
          } else if (status === 'failed' || status === 'timedOut') {
            report.summary.failed++;
            const error = test.results[0]?.error;
            
            const diagnosis = diagnoseError(testName, error);
            
            report.tests[testName] = {
              status,
              error: error?.message || 'Unknown error',
              diagnosis
            };
          }
        });
      });

      suite.suites?.forEach((subSuite: any) => processSuite(subSuite, currentTitle));
    }

    results.suites.forEach((suite: any) => processSuite(suite));
  }

  // 4. Generate Report
  console.log('\n================ TEST REPORT ================');
  console.log(`Passed: ${report.summary.passed}`);
  console.log(`Failed: ${report.summary.failed}`);
  console.log('=============================================\n');

  if (report.summary.failed > 0) {
    console.log('🚨 CRITICAL ISSUES DETECTED:');
    Object.entries(report.tests).forEach(([name, data]: [string, any]) => {
      if (data.status === 'failed') {
        console.log(`\n❌ [${name}]`);
        console.log(`   Error: ${data.error.split('\n')[0]}`);
        if (data.diagnosis) {
          console.log(`   💡 Root Cause: ${data.diagnosis.cause}`);
          console.log(`   🛠️ Suggestion: ${data.diagnosis.fix}`);
          if (data.diagnosis.snippet) {
            console.log(`   📝 Code Snippet:\n${data.diagnosis.snippet}`);
          }
        }
      }
    });
  }

  // Save JSON report
  fs.writeFileSync('diagnostic-report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Detailed report saved to diagnostic-report.json');
}

function diagnoseError(testName: string, error: any) {
  const msg = error.message || '';
  
  if (testName.includes('Supabase connection')) {
    return {
      cause: 'Invalid Supabase configuration or network issue.',
      fix: 'Check your .env file for correct NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
      snippet: 'NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co\nSUPABASE_SERVICE_ROLE_KEY=your-key'
    };
  }

  if (msg.includes('401') || msg.includes('Unauthorized')) {
    return {
      cause: 'Authentication failed. The user session is invalid or missing.',
      fix: 'Ensure the test user is correctly signed in or that the API route correctly handles auth cookies.',
    };
  }

  if (msg.includes('orphan rows') || msg.includes('missing or invalid week_id')) {
    return {
      cause: 'Data integrity issue: Some days do not belong to any week.',
      fix: 'Run a cleanup script to delete days with null week_id or assign them to a week.',
      snippet: 'DELETE FROM days WHERE week_id IS NULL;'
    };
  }

  if (msg.includes('exceeding max_score')) {
    return {
      cause: 'Business logic failure: Scores are being recorded higher than allowed.',
      fix: 'Check the quiz submission logic in /api/quiz/submit/route.ts to ensure score capping.',
    };
  }

  return {
    cause: 'Unexpected error. See details in the error log.',
    fix: 'Review the failing test code and the target component implementation.'
  };
}

runDiagnostics().catch(console.error);
