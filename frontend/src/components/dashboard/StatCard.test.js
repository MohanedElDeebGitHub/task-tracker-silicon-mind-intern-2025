import React from 'react';
import { render, screen } from '@testing-library/react';
import StatCard from './StatCard';

// Mock CSS imports
jest.mock('../../styles/dashboard.css', () => ({}));

describe('StatCard', () => {
  const defaultProps = {
    title: 'Total Tasks',
    value: '24',
    trend: '+5%'
  };

  test('renders stat card with title and value', () => {
    render(<StatCard {...defaultProps} />);
    
    expect(screen.getByText('Total Tasks')).toBeInTheDocument();
    expect(screen.getByText('24')).toBeInTheDocument();
  });

  test('displays positive trend with success color', () => {
    render(<StatCard {...defaultProps} trend="+10%" />);
    
    const trendElement = screen.getByText('+10%');
    expect(trendElement).toBeInTheDocument();
    expect(trendElement).toHaveClass('text-success');
  });

  test('displays negative trend with danger color', () => {
    render(<StatCard {...defaultProps} trend="-5%" />);
    
    const trendElement = screen.getByText('-5%');
    expect(trendElement).toBeInTheDocument();
    expect(trendElement).toHaveClass('text-danger');
  });

  test('renders without trend when trend is not provided', () => {
    const { container } = render(
      <StatCard title="Completed Tasks" value="12" />
    );
    
    expect(screen.getByText('Completed Tasks')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    
    // Should not have any trend element
    const trendElements = container.querySelectorAll('.text-success, .text-danger');
    expect(trendElements).toHaveLength(0);
  });

  test('renders with empty trend', () => {
    render(<StatCard {...defaultProps} trend="" />);
    
    expect(screen.getByText('Total Tasks')).toBeInTheDocument();
    expect(screen.getByText('24')).toBeInTheDocument();
    
    // Check that no trend element is rendered when trend is empty
    expect(screen.queryByTestId('trend-indicator')).not.toBeInTheDocument();
  });

  test('has correct Bootstrap classes for styling', () => {
    const { container } = render(<StatCard {...defaultProps} />);
    
    const card = container.querySelector('.card');
    expect(card).toHaveClass('shadow-sm', 'border-0');
    
    const cardBody = container.querySelector('.card-body');
    expect(cardBody).toBeInTheDocument();
    
    const flexDiv = container.querySelector('.d-flex.align-items-center');
    expect(flexDiv).toBeInTheDocument();
  });

  test('renders value with correct styling', () => {
    render(<StatCard {...defaultProps} />);
    
    const valueElement = screen.getByText('24');
    expect(valueElement).toHaveClass('mb-0', 'fw-bold');
  });

  test('renders title with correct styling', () => {
    render(<StatCard {...defaultProps} />);
    
    const titleElement = screen.getByText('Total Tasks');
    expect(titleElement).toHaveClass('text-muted');
  });

  test('renders stat icon placeholder', () => {
    const { container } = render(<StatCard {...defaultProps} />);
    
    const iconDiv = container.querySelector('.stat-icon');
    expect(iconDiv).toBeInTheDocument();
    expect(iconDiv).toHaveClass('me-3');
  });

  test('handles different value types', () => {
    render(<StatCard title="Progress" value="85%" trend="+2%" />);
    
    expect(screen.getByText('Progress')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('+2%')).toBeInTheDocument();
  });
});
