# 2011 AMC 12A Problem 13

## Problem
Triangle ABC has side-lengths AB = 12, BC = 24, and AC = 18. The line through the incenter of $\triangle ABC$ parallel to $\overline{BC}$ intersects $\overline{AB}$ at M and $\overline{AC}$ at N. What is the perimeter of $\triangle AMN$?

$\textbf{(A)}\ 27 \qquad \textbf{(B)}\ 30 \qquad \textbf{(C)}\ 33 \qquad \textbf{(D)}\ 36 \qquad \textbf{(E)}\ 42$
## Solution 1
Let O be the incenter of $\triangle{ABC}.$ Because $\overline{MO}$\parallel $\overline{BC}$ and $\overline{BO}$ is the angle bisector of $\angle{ABC},$ we have

$\angle{MBO} = \angle{CBO} = \angle{MOB} = \frac{1}{2}\angle{MBC}$

It then follows due to alternate interior angles and base angles of isosceles triangles that MO = MB. Similarly, NO = NC. The perimeter of $\triangle{AMN}$ then becomes

$$
\begin{align*} AM + MN + NA &= AM + MO + NO + NA \\ &= AM + MB + NC + NA \\ &= AB + AC \\ &= 30 \rightarrow \boxed{(B)} \end{align*}
$$

## Solution 2
Let  O  be the incenter.  AO  is the angle bisector of  $\angle MAN$ . Let the angle bisector of  $\angle BAC$  meets  BC  at  P  and the angle bisector of  $\angle ABC$  meets  AC  at  Q . By applying both angle bisector theorem and Menelaus' theorem,

$$\frac{AO}{OP} \times \frac{BP}{BC} \times \frac{CQ}{QA} = 1$$

$$\frac{AO}{OP} \times \frac{12}{30} \times \frac{24}{12} = 1$$

$$\frac{AO}{OP}=\frac{5}{4}$$

$$\frac{AO}{AP}=\frac{5}{9}$$

Perimeter of  $\triangle AMN = \frac{12+24+18}{9} \times 5 = 30 \rightarrow \boxed{(B)}$
## Solution 3
Like in other solutions, let O be the incenter of $\triangle ABC.$ Let AO intersect BC at D. By the angle bisector theorem, $\frac{BD}{DC} = \frac{AB}{AC} = \frac{12}{18} = \frac{2}{3}.$ Since BD+DC = 24, we have $\frac{BD}{24-BD} = \frac{2}{3},$ so 3BD = 48 - 2BD, so BD = $\frac{48}{5} = 9.6.$ By the angle bisector theorem on $\triangle ABD,$ we have $\frac{DO}{OA} = \frac{BD}{BA} = \frac{4}{5} = 0.8,$ so $\frac{DA}{OA} = 1 + \frac{DO}{OA} = \frac{9}{5} = 1.8,$ so $\frac{AO}{AD} = \frac{5}{9}.$ Because $\triangle AMN \sim \triangle ABC,$ the perimeter of $\triangle AMN$ must be $\frac{5}{9} (12 + 18 + 24) = 30,$ so our answer is $\boxed{\textbf{(B)}\ 30}.$

Another way to find $\frac{AO}{OD}$ is to use mass points. Assign a mass of 24 to A, a mass of 18 to B, and a mass of 12 to C. Then D has mass 30, so $\frac{AO}{OD} = \frac{30}{24} = \frac{5}{4} = 1.25.$
## Solution 4
We know that the ratio of the perimeter of $\triangle AMN$ and $\triangle ABC$ is the ratio of their heights, and finding the two heights is pretty easy. Note that the height from A to BC is $\frac{9\sqrt{15}}{4}$ from Herons and then A=$\frac{bh}{2}$ and also that the height from A to MN is simply the height from A to BC minus the inradius. We know the area and the semiperimeter so $r=\frac{A}{s}$ which gives us $r=\sqrt{15}.$ Now we know that the altitude from A to MN is $\frac{5\sqrt{15}}{4}$ so the ratios of the heights from A for $\triangle AMN$ and $\triangle ABC$ is $\frac{5}{9}.$ Thus the perimeter of $\triangle AMN$ is $\frac{5}{9} \times 54 = 30$ so our answer is $\boxed{B}$

*~srisainandan6*
## Video Solution
https://www.youtube.com/watch?v=u23iWcqbJlE
*~Shreyas S*
## Video Solution by OmegaLearn
https://youtu.be/5jwD5UViZO8?t=1013

*~pi_is_3.14*
## See also
