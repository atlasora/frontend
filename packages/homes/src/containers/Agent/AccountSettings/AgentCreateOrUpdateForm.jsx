import React, { useContext, Fragment } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Row, Col, Input, Select, Button, DatePicker } from 'antd';
import FormControl from 'components/UI/FormControl/FormControl';
// import DatePicker from 'components/UI/AntdDatePicker/AntdDatePicker';
import { FormTitle } from './AccountSettings.style';
import { AuthContext } from 'context/AuthProvider';
import dayjs from 'dayjs';

const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'Other' },
];
const languageOptions = [
  { label: 'English', value: 'english' },
  { label: 'Spanish', value: 'spanish' },
  { label: 'French', value: 'french' },
  { label: 'Russian', value: 'russian' },
];
//{"id":3,"documentId":"hqcktcs1thyuh501hf9n6qpg","username":"333","email":"chrisjmccreadie3@protonmail.com","provider":"local","confirmed":true,"blocked":false,"createdAt":"2025-07-02T18:17:33.951Z","updatedAt":"2025-07-08T17:55:42.033Z","publishedAt":"2025-07-08T17:55:42.017Z","FirstName":"Chris","SecondName":"McC","Twitter":"tw","Facebook":"fb","Instagram":"i","Bio":"This a bio","DateOfBirth":"2025-07-11","Gender":"Male","PreferredLanguage":"English","PhoneNUmber":"07400034168","Location":"London","avatar":"http://localhost:1337/uploads/thumbnail_favicon_15c376b1a2.png"}
const AgentCreateOrUpdateForm = () => {
  const { user: userInfo } = useContext(AuthContext); // 👈 This is missing
  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm();
  const onSubmit = (data) => console.log(data);
  return (
    <Fragment>
      <FormTitle>Basic Information</FormTitle>
      <form className="form-container" onSubmit={handleSubmit(onSubmit)}>
        <Row gutter={30}>
          <Col lg={12} xs={24}>
            <FormControl
              label="First name"
              htmlFor="firstName"
              error={errors.firstName && <span>This field is required!</span>}
            >
              <Controller
                name="firstName"
                defaultValue={userInfo?.FirstName || ''}
                control={control}
                rules={{ required: true }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input onChange={onChange} onBlur={onBlur} value={value} />
                )}
              />
            </FormControl>
          </Col>
          <Col lg={12} xs={24}>
            <FormControl
              label="Last name"
              htmlFor="lastName"
              error={errors.lastName && <span>This field is required!</span>}
            >
              <Controller
                name="lastName"
                defaultValue={userInfo?.SecondName || ''}
                control={control}
                rules={{ required: true }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input onChange={onChange} onBlur={onBlur} value={value} />
                )}
              />
            </FormControl>
          </Col>
        </Row>
        <Row gutter={30}>
          <Col lg={12} xs={24}>
            <FormControl
              label="Date of birth"
              htmlFor="dateOfBirthday"
              error={
                errors.dateOfBirthday && <span>This field is required!</span>
              }
            >
              <Controller
                name="dateOfBirthday"
                defaultValue={
                  userInfo?.DateOfBirth ? dayjs(userInfo.DateOfBirth) : null
                }
                control={control}
                rules={{ required: true }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <DatePicker
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value ? dayjs(value) : null}
                    format="YYYY-MM-DD"
                  />
                )}
              />
            </FormControl>
          </Col>
          <Col lg={12} xs={24}>
            <Row gutter={30}>
              <Col sm={12} xs={24}>
                <FormControl
                  label="I am"
                  htmlFor="agentGender"
                  error={
                    errors.agentGender && <span>This field is required!</span>
                  }
                >
                  <Controller
                    name="agentGender"
                    defaultValue={userInfo?.Gender || ''}
                    control={control}
                    rules={{ required: true }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Select
                        options={genderOptions}
                        onChange={onChange}
                        onBlur={onBlur}
                        defaultValue={value || 'male'}
                      />
                    )}
                  />
                </FormControl>
              </Col>
              <Col sm={12} xs={24}>
                <FormControl
                  label="Preferred Language"
                  htmlFor="preferredLanguage"
                  error={
                    errors.preferredLanguage && (
                      <span>This field is required!</span>
                    )
                  }
                >
                  <Controller
                    name="preferredLanguage"
                    defaultValue={userInfo?.PreferredLanguage || ''}
                    control={control}
                    rules={{ required: true }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Select
                        options={languageOptions}
                        onChange={onChange}
                        onBlur={onBlur}
                        defaultValue={value || 'english'}
                      />
                    )}
                  />
                </FormControl>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row gutter={30}>
          <Col lg={12} xs={24}>
            <FormControl
              label="Email address"
              htmlFor="email"
              error={
                errors.email && (
                  <>
                    {errors.email?.type === 'required' && (
                      <span>This field is required!</span>
                    )}
                    {errors.email?.type === 'pattern' && (
                      <span>Please enter a valid email address!</span>
                    )}
                  </>
                )
              }
            >
              <Controller
                name="email"
                defaultValue={userInfo?.email || ''}
                control={control}
                rules={{
                  required: true,
                  pattern: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    type="email"
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                )}
              />
            </FormControl>
          </Col>
          <Col lg={12} xs={24}>
            <FormControl
              label="Phone number"
              htmlFor="phoneNumber"
              error={
                errors.phoneNumber && (
                  <>
                    {errors.phoneNumber?.type === 'required' && (
                      <span>This field is required!</span>
                    )}
                    {errors.phoneNumber?.type === 'pattern' && (
                      <span>Please enter your valid number!</span>
                    )}
                  </>
                )
              }
            >
              <Controller
                name="phoneNumber"
                defaultValue={userInfo?.PhoneNumber || ''}
                control={control}
                rules={{
                  required: true,
                  pattern: /^[0-9]*$/,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input onChange={onChange} onBlur={onBlur} value={value} />
                )}
              />
            </FormControl>
          </Col>
          <Col lg={24} xs={24}>
            <FormControl
              label="Where you live"
              htmlFor="address"
              error={errors.address && <span>This field is required!</span>}
            >
              <Controller
                name="address"
                defaultValue={userInfo?.Location || ''}
                control={control}
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input onChange={onChange} onBlur={onBlur} value={value} />
                )}
              />
            </FormControl>
          </Col>
          <Col lg={24} xs={24}>
            <FormControl
              label="Describe Yourself (Optional)"
              htmlFor="describeYourself"
            >
              <Controller
                name="describeYourself"
                defaultValue={userInfo?.Bio || ''}
                control={control}
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input.TextArea
                    rows={5}
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                )}
              />
            </FormControl>
          </Col>
        </Row>
        <div className="submit-container">
          <Button htmlType="submit" type="primary">
            Save Changes
          </Button>
        </div>
      </form>
    </Fragment>
  );
};

export default AgentCreateOrUpdateForm;
