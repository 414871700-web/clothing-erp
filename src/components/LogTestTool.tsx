import { useState } from 'react';
import { logsApi } from '@/lib/logs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export function LogTestTool() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [errorDetails, setErrorDetails] = useState<string>('');

  const testLog = async () => {
    setTesting(true);
    setResult(null);
    setErrorDetails('');

    try {
      console.log('[测试] 开始测试日志记录...');
      
      const testLog = await logsApi.createLog({
        operationType: '测试',
        module: '系统',
        recordName: '日志测试',
        description: '这是一条测试日志，用于验证操作日志功能是否正常',
        newValue: {
          test: true,
          timestamp: new Date().toISOString(),
        },
      });

      if (testLog) {
        console.log('[测试] 测试日志创建成功:', testLog);
        setResult({
          type: 'success',
          message: '日志记录成功！请刷新页面查看日志列表',
        });
      } else {
        console.log('[测试] 测试日志创建失败');
        setResult({
          type: 'error',
          message: '日志记录失败，请检查浏览器控制台错误',
        });
      }
    } catch (err: any) {
      console.error('[测试] 测试过程中发生错误:', err);
      setResult({
        type: 'error',
        message: `错误: ${err.message || '未知错误'}`,
      });
      setErrorDetails(err.details || err.hint || JSON.stringify(err, null, 2));
    } finally {
      setTesting(false);
    }
  };

  const refreshLogs = async () => {
    try {
      const logs = await logsApi.getLogs({ pageSize: 5 });
      console.log('[测试] 最新日志:', logs);
      alert(`当前共有 ${logs.total} 条日志\n最新一条: ${logs.logs[0]?.description || '无'}`);
    } catch (err: any) {
      console.error('[测试] 获取日志失败:', err);
      alert(`获取日志失败: ${err.message}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 操作日志测试工具</CardTitle>
          <CardDescription>
            使用此工具测试操作日志功能是否正常工作
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">测试步骤：</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600">
              <li>点击"测试日志记录"按钮创建一条测试日志</li>
              <li>查看浏览器控制台（F12）的输出信息</li>
              <li>查看下方的测试结果</li>
              <li>点击"查看最新日志"验证日志是否成功插入</li>
            </ol>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={testLog}
              disabled={testing}
              className="flex-1"
            >
              {testing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  测试中...
                </>
              ) : (
                '🧪 测试日志记录'
              )}
            </Button>

            <Button
              onClick={refreshLogs}
              variant="outline"
            >
              📋 查看最新日志
            </Button>
          </div>

          {result && (
            <div
              className={`p-4 rounded-lg ${
                result.type === 'success'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {result.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`font-medium ${
                    result.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {result.message}
                  </p>
                  
                  {errorDetails && (
                    <div className="mt-3">
                      <p className="text-xs text-red-600 font-medium mb-1">错误详情：</p>
                      <pre className="text-xs text-red-700 bg-red-100 p-2 rounded overflow-x-auto">
                        {errorDetails}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800 mb-1">
                  提示
                </p>
                <ul className="text-xs text-amber-700 space-y-1">
                  <li>• 请打开浏览器开发者工具（F12）查看控制台输出</li>
                  <li>• 如果看到"插入操作日志失败"，请执行 database/schema-logs-fix.sql</li>
                  <li>• 确保 Supabase 项目中已执行日志相关的 SQL 脚本</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-700 mb-2">数据库检查清单：</h4>
            <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside">
              <li>operation_logs 表已创建</li>
              <li>user_profiles 表的 RLS 已禁用或配置正确</li>
              <li>operation_logs 的 RLS 策略允许插入</li>
              <li>已登录用户有 user_id</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
