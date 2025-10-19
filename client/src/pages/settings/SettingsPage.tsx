import { useEffect, useState } from 'react';
import { Form, Input, Button, Select, InputNumber, Switch, message, Card, Tabs, Divider } from 'antd';
import { UserOutlined, SettingOutlined, LockOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchUserProfile, fetchUserSettings } from '../../store/slices/userSlice';
import userService, { UpdateUserDto, ChangePasswordDto, UpdateSettingsDto } from '../../services/userService';
import './SettingsPage.scss';

const { TabPane } = Tabs;

/**
 * 用户设置页面
 */
const SettingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { profile, settings } = useAppSelector((state) => state.user);
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [settingsForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchUserProfile());
    dispatch(fetchUserSettings());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      profileForm.setFieldsValue({
        username: profile.username,
        email: profile.email,
        nickname: profile.nickname,
      });
    }
  }, [profile, profileForm]);

  useEffect(() => {
    if (settings) {
      settingsForm.setFieldsValue({
        theme: settings.theme,
        language: settings.language,
        notificationsEnabled: settings.notificationsEnabled,
        emailNotifications: settings.emailNotifications,
        workDuration: settings.workDuration,
        restDuration: settings.restDuration,
      });
    }
  }, [settings, settingsForm]);

  const handleUpdateProfile = async (values: UpdateUserDto) => {
    setLoading(true);
    try {
      await userService.updateProfile(values);
      dispatch(fetchUserProfile());
      message.success('个人信息更新成功');
    } catch (error: any) {
      message.error(error.response?.data?.message || '更新失败');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values: ChangePasswordDto) => {
    setLoading(true);
    try {
      await userService.changePassword(values);
      passwordForm.resetFields();
      message.success('密码修改成功');
    } catch (error: any) {
      message.error(error.response?.data?.message || '修改失败');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (values: UpdateSettingsDto) => {
    setLoading(true);
    try {
      await userService.updateSettings(values);
      dispatch(fetchUserSettings());
      message.success('设置更新成功');
    } catch (error: any) {
      message.error(error.response?.data?.message || '更新失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-page">
      <Card title="用户设置">
        <Tabs defaultActiveKey="profile">
          <TabPane
            tab={
              <span>
                <UserOutlined />
                个人信息
              </span>
            }
            key="profile"
          >
            <Form
              form={profileForm}
              layout="vertical"
              onFinish={handleUpdateProfile}
              autoComplete="off"
            >
              <Form.Item label="用户名" name="username">
                <Input disabled />
              </Form.Item>

              <Form.Item
                label="昵称"
                name="nickname"
                rules={[
                  { required: true, message: '请输入昵称' },
                  { min: 2, message: '昵称至少2个字符' },
                  { max: 100, message: '昵称最多100个字符' },
                ]}
              >
                <Input placeholder="请输入昵称" />
              </Form.Item>

              <Form.Item
                label="邮箱"
                name="email"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' },
                ]}
              >
                <Input placeholder="请输入邮箱" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  保存修改
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane
            tab={
              <span>
                <LockOutlined />
                修改密码
              </span>
            }
            key="password"
          >
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handleChangePassword}
              autoComplete="off"
            >
              <Form.Item
                label="当前密码"
                name="oldPassword"
                rules={[
                  { required: true, message: '请输入当前密码' },
                  { min: 6, message: '密码至少6个字符' },
                ]}
              >
                <Input.Password placeholder="请输入当前密码" />
              </Form.Item>

              <Form.Item
                label="新密码"
                name="newPassword"
                rules={[
                  { required: true, message: '请输入新密码' },
                  { min: 6, message: '密码至少6个字符' },
                ]}
              >
                <Input.Password placeholder="请输入新密码" />
              </Form.Item>

              <Form.Item
                label="确认新密码"
                name="confirmPassword"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: '请确认新密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="请确认新密码" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  修改密码
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane
            tab={
              <span>
                <SettingOutlined />
                偏好设置
              </span>
            }
            key="settings"
          >
            <Form
              form={settingsForm}
              layout="vertical"
              onFinish={handleUpdateSettings}
              autoComplete="off"
            >
              <Form.Item label="主题" name="theme">
                <Select>
                  <Select.Option value="LIGHT">浅色</Select.Option>
                  <Select.Option value="DARK">深色</Select.Option>
                  <Select.Option value="AUTO">自动</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item label="语言" name="language">
                <Select>
                  <Select.Option value="ZH">简体中文</Select.Option>
                  <Select.Option value="EN">English</Select.Option>
                </Select>
              </Form.Item>

              <Divider>通知设置</Divider>

              <Form.Item label="启用通知" name="notificationsEnabled" valuePropName="checked">
                <Switch />
              </Form.Item>

              <Form.Item label="邮件通知" name="emailNotifications" valuePropName="checked">
                <Switch />
              </Form.Item>

              <Divider>番茄钟设置</Divider>

              <Form.Item
                label="工作时长（分钟）"
                name="workDuration"
                rules={[
                  { required: true, message: '请输入工作时长' },
                  { type: 'number', min: 1, max: 120, message: '工作时长范围1-120分钟' },
                ]}
              >
                <InputNumber min={1} max={120} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                label="休息时长（分钟）"
                name="restDuration"
                rules={[
                  { required: true, message: '请输入休息时长' },
                  { type: 'number', min: 1, max: 60, message: '休息时长范围1-60分钟' },
                ]}
              >
                <InputNumber min={1} max={60} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  保存设置
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default SettingsPage;
