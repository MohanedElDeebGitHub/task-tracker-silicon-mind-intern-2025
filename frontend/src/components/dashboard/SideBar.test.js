import React from 'react';
import { render, screen } from '@testing-library/react';
import SideBar from './SideBar';

// Mock CSS imports
jest.mock('../../styles/dashboard.css', () => ({}));

describe('SideBar', () => {
  const defaultUser = 'John Doe';

  test('renders TrackR brand name', () => {
    render(<SideBar user={defaultUser} />);
    
    expect(screen.getByText('TrackR')).toBeInTheDocument();
  });

  test('displays user name in profile section', () => {
    render(<SideBar user={defaultUser} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  test('shows free plan user permission', () => {
    render(<SideBar user={defaultUser} />);
    
    expect(screen.getByText('free plan user')).toBeInTheDocument();
  });

  test('renders Tasks navigation item', () => {
    render(<SideBar user={defaultUser} />);
    
    expect(screen.getByText('Tasks')).toBeInTheDocument();
  });

  test('has correct CSS classes for layout', () => {
    const { container } = render(<SideBar user={defaultUser} />);
    
    const sidebar = container.querySelector('.SideBar');
    expect(sidebar).toBeInTheDocument();
    
    const sidebarTop = container.querySelector('.sidebar-top-content');
    expect(sidebarTop).toBeInTheDocument();
    
    const userProfile = container.querySelector('.user-profile');
    expect(userProfile).toBeInTheDocument();
  });

  test('renders active card with correct styling', () => {
    const { container } = render(<SideBar user={defaultUser} />);
    
    const activeCard = container.querySelector('.SideBar-active-card');
    expect(activeCard).toBeInTheDocument();
    expect(activeCard).toHaveClass('border-0', 'rounded-3', 'shadow-sm');
  });

  test('displays task icon in active card', () => {
    const { container } = render(<SideBar user={defaultUser} />);
    
    const taskIcon = container.querySelector('.fas.fa-tasks');
    expect(taskIcon).toBeInTheDocument();
    expect(taskIcon).toHaveClass('text-white');
  });

  test('displays chevron right icon', () => {
    const { container } = render(<SideBar user={defaultUser} />);
    
    const chevronIcon = container.querySelector('.fas.fa-chevron-right');
    expect(chevronIcon).toBeInTheDocument();
    expect(chevronIcon).toHaveClass('text-white-50');
  });

  test('renders user profile section structure', () => {
    const { container } = render(<SideBar user={defaultUser} />);
    
    const userIcon = container.querySelector('.user-icon');
    expect(userIcon).toBeInTheDocument();
    
    const userName = container.querySelector('.user-profile-name');
    expect(userName).toBeInTheDocument();
    expect(userName).toHaveTextContent('John Doe');
    
    const userPermission = container.querySelector('.user-profile-permission');
    expect(userPermission).toBeInTheDocument();
    expect(userPermission).toHaveTextContent('free plan user');
  });

  test('handles different user names', () => {
    const { rerender } = render(<SideBar user="Alice Smith" />);
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    
    rerender(<SideBar user="Bob Johnson" />);
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  test('handles empty user name gracefully', () => {
    render(<SideBar user="" />);
    
    const userNameElement = screen.getByText('free plan user').parentElement.querySelector('.user-profile-name');
    expect(userNameElement).toHaveTextContent('');
  });

  test('handles undefined user gracefully', () => {
    render(<SideBar user={undefined} />);
    
    // Should still render the sidebar structure
    expect(screen.getByText('TrackR')).toBeInTheDocument();
    expect(screen.getByText('free plan user')).toBeInTheDocument();
  });
});
