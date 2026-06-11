import { CheckIcon } from './Icons';
export default function Toast({ msg }) {
  return (
    <div className="toast">
      <span style={{ color: '#4ADE80' }}><CheckIcon /></span>
      {msg}
    </div>
  );
}
