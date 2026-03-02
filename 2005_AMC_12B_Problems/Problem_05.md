# 2005 AMC 12B Problem 5

> This problem is the same as [2005 AMC 12B #5](https://artofproblemsolving.com/wiki/index.php/2005_AMC_12B_Problems) and [2005 AMC 10B #8](https://artofproblemsolving.com/wiki/index.php/2005_AMC_10B_Problems).
## Problem
An 8 -foot by 10-foot bathroom floor is tiled with square tiles of size 1 foot by 1 foot.  Each tile has a pattern consisting of four white quarter circles of radius 1/2 foot centered at each corner of the tile.  The remaining portion of the tile is shaded.  How many square feet of the floor are shaded?


> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(2cm); defaultpen(linewidth(.8pt)); fill(unitsquare,gray); filldraw(Arc((0,0),.5,0,90)--(0,0)--cycle,white,black); filldraw(Arc((1,0),.5,90,180)--(1,0)--cycle,white,black); filldraw(Arc((1,1),.5,180,270)--(1,1)--cycle,white,black); filldraw(Arc((0,1),.5,270,360)--(0,1)--cycle,white,black);
```


$\textbf{(A) }\ 80-20\pi \qquad \textbf{(B) }\ 60-10\pi \qquad \textbf{(C) }\ 80-10\pi \qquad \textbf{(D) }\ 60+10\pi \qquad \textbf{(E) }\ 80+10\pi$
## Solution
There are 80 tiles.  Each tile has [\mbox{square} - 4 $\cdot ($\mbox{quarter circle})] shaded.  Thus:


$$
\begin{align*} \mbox{shaded area} &= 80 \left( 1 - 4 \cdot \dfrac{1}{4} \cdot \pi \cdot \left(\dfrac{1}{2}\right)^2\right) \\ &= 80\left(1-\dfrac{1}{4}\pi\right) \\ &= \boxed{\textbf{(A) }80-20\pi}. \end{align*}
$$

4 quarters of a circle is a circle so that may save you 0.5 seconds (very much lots) :)
## See also
