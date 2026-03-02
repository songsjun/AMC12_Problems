# 2014 AMC 12A Problem 25

## Problem
The parabola P has focus (0,0) and goes through the points (4,3) and (-4,-3).  For how many points (x,y)$\in P$ with integer coordinates is it true that |$4x+$3y|$\leq 1000$?

$\textbf{(A) }38\qquad \textbf{(B) }40\qquad \textbf{(C) }42\qquad \textbf{(D) }44\qquad \textbf{(E) }46\qquad$
## Solution
The parabola is symmetric through y=- $\frac{4}{3}$x, and the common distance is 5, so the directrix is the line through (1,7) and (-7,1), which is the line  $3x-4$y = -25.  Using the point-line distance formula, the parabola is the locus  $x^2+y^2 =\frac{\left\lvert 3x-4y+25 \right\rvert^2}{3^2+4^2}$  which rearranges to ($4x+3y)^2 =25(6x-8y+25)$.

Let m = $4x+3y \in \mathbb Z, \left$\lvert m $\right$\rvert $\le 1000.$  Put $m =25k$ to obtain
$$25k^2 = 6x-8y+2525k = 4x+3y.$$
and accordingly we find by solving the system that $x =\frac{1}{2} (3k^2-3) + 4$k and y = -$2k^2+3k+2$.

One can show that the values of k that make (x,y) an integer pair are precisely odd integers k.*  For $\left$\lvert $25k\right$\rvert $\le 1000$ this is k= -39,-37,-35,$\dots,39,$ so 40 values work and the answer is $\boxed{\textbf{(B)}}.$

(Solution by C-273)

*You can do this by noting 2 has to divide $(3k^2-3)$, so $3k^2$ is congruent to 3 modulo 2. Dividing by 3 (since 2 and 3 are coprime), k^2 is odd, so k must be odd. - (Orion 2010)
## Solution 2
The axis of P is inclined at an angle $\theta$ relative to the coordinate axis, where $\tan\theta = \tfrac 34.$ We rotate the coordinate axis by angle $\theta$ anti-clockwise, so that the parabola now has a vertical symmetry axis relative to the rotated coordinates. Let ($\widetilde{x}, \widetilde{y})$ be the coordinates in the rotated system. Then (x,y) and ($\widetilde{x}, \widetilde{y})$ are related by

$$
\begin{align} \nonumber x = \widetilde{x}\cos\theta -\widetilde{y}\sin\theta &= \tfrac 45 \widetilde{x} - \tfrac 35 \widetilde{y}, \\ y = \widetilde{x}\sin\theta +\widetilde{y}\cos\theta &= \tfrac 35 \widetilde{x} + \tfrac 45 \widetilde{y} \end{align}
$$

In the rotated coordinate system, the parabola has focus at (0,0) and the two points on it are at (5,0) and (-5,0). Therefore, the directrix is $\widetilde{y}=\pm 5$; we can, WLOG, choose $\widetilde{y}=-5.$ For a point on the parabola, it is equidistant from the focus and directrix, so the equation of the parabola is

$$
\begin{align}\tag{2} \widetilde{x}^2+\widetilde{y}^2 = (\widetilde{y}+5)^2 \qquad &\Longrightarrow\qquad \widetilde{y} = \tfrac{1}{10}(\widetilde{x}^2-25) \end{align}
$$

From (1) we have |$4x+$3y|=$5\widetilde{x},$ so we need |$\widetilde{x}$|<200. Substituting (2) in (1), we get

$$
\begin{align*} 50x &= 40 \widetilde{x} - 3 \widetilde{x}^2 + 75, \\ 50y &= 30 \widetilde{x} + 4 \widetilde{x}^2 - 100 \end{align*}
$$

For x to be an integer $\widetilde{x}$ must be a multiple of 5; setting $\widetilde{x}=5$a we get
$$2x = 8a - 3 a^2 + 3$$
Now we need a to be odd, i.e. $\widetilde{x}=5$a is an odd multiple of 5, in which case we get $y = 3 a + 2 a^2 - 2,$ which is also an integer. The values that satisfy the given conditions correspond to $\widetilde{x}=\{\pm 5\cdot (2k-1)\mid k = 0, 1, \ldots , 19 \}$={-195, -185, -175, ..., 195}, and there are $\boxed{\textbf{(B)} \ 40}$ such numbers.

(Solution by Shaddoll)
### Video Solution by Richard Rusczyk
https://artofproblemsolving.com/videos/amc/2014amc12a/384
