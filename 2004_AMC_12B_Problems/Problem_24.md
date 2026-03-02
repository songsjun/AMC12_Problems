# 2004 AMC 12B Problem 24

## Problem
In $\triangle ABC, AB = BC,$ and $\overline{BD}$ is an [altitude](https://artofproblemsolving.com/wiki/index.php/altitude). Point E is on the extension of $\overline{AC}$ such that BE = 10. The values of $\tan \angle CBE, \tan \angle DBE,$ and $\tan \angle ABE$ form a [geometric progression](https://artofproblemsolving.com/wiki/index.php/geometric_progression), and the values of $\cot \angle DBE, \cot \angle CBE, \cot \angle DBC$ form an [arithmetic progression](https://artofproblemsolving.com/wiki/index.php/arithmetic_progression). What is the area of $\triangle ABC$?


> [Asymptote diagram - not rendered in Markdown]

```asy
size(120); defaultpen(0.7); pair $A = (0,0), D = (5*2^.5/3,0), C = (10*2^.5/3,0), B = (5*2^.5/3,5*2^.5), E = (13*2^.5/3,0)$; draw(A--D--C--E--B--C--D--B--cycle); label("$A$",A,S); label("$B$",B,N); label("$C$",C,S); label("$D$",D,S); label("$E$",E,S);
```


$$\mathrm{(A)}\ 16 \qquad\mathrm{(B)}\ \frac {50}3 \qquad\mathrm{(C)}\ 10\sqrt{3} \qquad\mathrm{(D)}\ 8\sqrt{5} \qquad\mathrm{(E)}\ 18$$

## Solution
Let $\alpha = DBC.$ Then the first condition tells us that
 $\tan^2 DBE = \tan(DBE - \alpha)\tan(DBE + \alpha) = \frac$ {$\tan^2 DBE - \tan^2 \alpha$}{1 - $\tan ^2 DBE \tan^2 \alpha$},
and multiplying out gives us ($\tan^4 DBE - 1) \tan^2 \alpha = 0.$ Since $\tan\alpha \neq 0,$ we have $\tan^4 DBE = 1 \Longrightarrow \angle DBE = 45^{\circ}.$

The second condition tells us that $2\cot (45 - \alpha) = 1 + \cot \alpha.$ Expanding, we have 1 + $\cot \alpha = 2\left$[$\frac$ {$\cot \alpha + 1}{\cot \alpha - 1}\right$] $\Longrightarrow (\cot \alpha - 3)(\cot \alpha + 1) = 0.$ Evidently $\cot \alpha \neq - 1,$ so we get $\cot \alpha = 3.$

Now BD = $5\sqrt$ {2} and AC = $\frac$ {2BD} {$\cot \alpha$} = $\frac$ {$10\sqrt$ {2}}{3}. Thus, [ABC] = $\frac$ {1}{2} $\cdot 5\sqrt$ {2} $\cdot \frac$ {$10\sqrt$ {2}}{3} = $\frac$ {50}{3}\ $\mathrm{(B)}.$
## See also
