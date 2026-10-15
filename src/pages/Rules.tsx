import { Link } from 'react-router'
import { WORKSHOP_NAME } from '../lib/config'
import { RULES, RULES_DATE } from '../data/rules'
import { formatDate } from '../lib/format'

export default function Rules() {
  return (
    <div>
      <div className="border-b-[3px] border-pitch-800 pb-4">
        <p className="eyebrow">Prize rules · {formatDate(`${RULES_DATE}T12:00:00Z`)}</p>
        <h1 className="display my-4 text-[34px] leading-[1.04] tracking-[-1.6px] text-pitch-900">
          The small print,
          <br />
          in big letters.
        </h1>
        <p className="text-[15px] text-stone-600">
          How the monthly prize works. {WORKSHOP_NAME} posts any change in the league group first.
        </p>
      </div>

      {RULES.map((section, s) => (
        <section
          key={section.title}
          className="grid grid-cols-[27px_1fr] gap-2.5 border-b border-pine-200 py-6"
        >
          <span className="pt-1 font-mono text-[13px] text-pine-600">
            {String(s + 1).padStart(2, '0')}
          </span>
          <div>
            <h2 className="display text-[23px] tracking-[-0.5px]">{section.title}</h2>
            <ol className="mt-3 space-y-3">
              {section.items.map((item, i) => (
                <li key={i} className="grid grid-cols-[30px_1fr] text-[15px] leading-relaxed">
                  <span className="font-mono text-xs leading-[1.9] text-stone-500">
                    {s + 1}.{i + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ))}

      <section className="notice">
        <h2 className="display text-base">How the app applies them</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-4 text-[13px] leading-relaxed">
          <li>
            A month’s points are the ones in FPL’s own monthly league table: gameweek scores after
            transfer costs, except that FPL leaves hits for the month’s first gameweek alone.
          </li>
          <li>Dates and deadlines are read in Malawi time.</li>
          <li>
            A month is settled once FPL marks its last gameweek as processed. Until then the table
            shows who is leading, not who has won.
          </li>
          <li>
            The app records every draw: when it happened, the gifts still available, and the one
            drawn.
          </li>
          <li>Pick your own team in the app so the winner can be matched to an account.</li>
        </ul>
      </section>

      <Link to="/about" className="btn btn-text mt-2">
        ← About the league
      </Link>
    </div>
  )
}
